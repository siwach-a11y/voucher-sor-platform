import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@voucher-sor/db";
import type { Prisma } from "@voucher-sor/db";
import { decideRoute } from "@voucher-sor/sor-engine";
import { logEvent } from "@voucher-sor/logger";
import type { OrderExecutionEvent, OrderStatus } from "@voucher-sor/shared-types";
import { loadScoringCandidates, toNumber } from "../lib/scoring-candidates.js";
import { executionQueue } from "../queues.js";
import { simulateExecution } from "../lib/demo-execution.js";

const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * The worker never emits fine-grained OrderExecutionEvent steps (it calls ExecutionRouter.execute()
 * once and gets back a final ExecutionResult), so this endpoint approximates the step from
 * Order.status via polling rather than relaying real per-step events over Redis pub/sub.
 */
const STATUS_TO_STEP: Record<OrderStatus, OrderExecutionEvent["step"]> = {
  pending: "queued",
  routing: "routing_decided",
  executing: "checking_out",
  awaiting_user_approval: "awaiting_otp",
  paid: "paying",
  extracting_voucher: "extracting_voucher",
  completed: "completed",
  failed: "failed",
  cancelled: "failed",
};

const createOrderSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  sellingPrice: z.number().positive(),
});

/** Prisma returns Decimal for purchasePrice/sellingPrice; shared-types' Order models them as number. */
function serializeOrder<T extends { purchasePrice: unknown; sellingPrice: unknown }>(order: T) {
  return { ...order, purchasePrice: order.purchasePrice ? toNumber(order.purchasePrice) : null, sellingPrice: toNumber(order.sellingPrice) };
}

export async function ordersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post("/", async (request, reply) => {
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
    const { userId, productId, sellingPrice } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return reply.status(404).send({ error: "Product not found" });

    // No signup/auth flow yet (see docs/ROADMAP.md) — the frontend sends a fixed userId with
    // nothing to have created the row ahead of time, so provision it here rather than 404ing.
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@users.voucher-sor.local` },
    });

    const { candidates, offers } = await loadScoringCandidates(productId);
    const decision = decideRoute(productId, candidates);
    const winningOffer = decision.selectedVendorId
      ? offers.find((offer) => offer.vendorId === decision.selectedVendorId)
      : undefined;

    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        vendorId: decision.selectedVendorId,
        sellingPrice,
        currency: winningOffer?.currency ?? "USD",
        status: decision.selectedVendorId ? "routing" : "failed",
        failureReason: decision.selectedVendorId ? null : decision.decisionReason,
      },
    });

    const routingLog = await prisma.routingLog.create({
      data: {
        orderId: order.id,
        selectedVendorId: decision.selectedVendorId,
        candidateScores: decision.candidates as unknown as Prisma.InputJsonValue,
        decisionReason: decision.decisionReason,
        executionResult: "pending",
      },
    });

    logEvent("routing_decision", {
      orderId: order.id,
      vendorId: decision.selectedVendorId ?? undefined,
      message: decision.decisionReason,
      metadata: { candidateCount: decision.candidates.length },
    });
    await prisma.eventLog.create({
      data: {
        type: "routing_decision",
        orderId: order.id,
        vendorId: decision.selectedVendorId,
        message: decision.decisionReason,
        metadata: { candidateCount: decision.candidates.length },
      },
    });

    if (decision.selectedVendorId) {
      if (DEMO_MODE) {
        void simulateExecution({
          orderId: order.id,
          vendorId: decision.selectedVendorId,
          routingLogId: routingLog.id,
          price: winningOffer ? toNumber(winningOffer.price) : sellingPrice,
        });
      } else if (executionQueue) {
        await executionQueue.add(
          "execute-order",
          { orderId: order.id },
          { attempts: 3, backoff: { type: "exponential", delay: 5000 } },
        );
      }
    }

    return reply.status(201).send(serializeOrder(order));
  });

  fastify.get<{ Querystring: { userId?: string } }>("/", async (request, reply) => {
    const orders = await prisma.order.findMany({
      where: request.query.userId ? { userId: request.query.userId } : {},
      orderBy: { createdAt: "desc" },
    });
    return reply.send(orders.map(serializeOrder));
  });

  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const order = await prisma.order.findUnique({ where: { id: request.params.id } });
    if (!order) return reply.status(404).send({ error: "Order not found" });
    return reply.send(serializeOrder(order));
  });

  fastify.get<{ Params: { id: string } }>("/:id/events", async (request, reply) => {
    const { id } = request.params;
    const initial = await prisma.order.findUnique({ where: { id } });
    if (!initial) return reply.status(404).send({ error: "Order not found" });

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const terminalStatuses = new Set<OrderStatus>(["completed", "failed", "cancelled"]);
    let lastStatus: OrderStatus | null = null;

    const send = (status: OrderStatus, updatedAt: Date) => {
      const event: OrderExecutionEvent = {
        orderId: id,
        step: STATUS_TO_STEP[status],
        message: `Order status: ${status}`,
        timestamp: updatedAt.toISOString(),
      };
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    send(initial.status, initial.updatedAt);
    lastStatus = initial.status;
    if (terminalStatuses.has(initial.status)) {
      reply.raw.end();
      return;
    }

    const interval = setInterval(async () => {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        clearInterval(interval);
        reply.raw.end();
        return;
      }
      if (order.status !== lastStatus) {
        send(order.status, order.updatedAt);
        lastStatus = order.status;
      }
      if (terminalStatuses.has(order.status)) {
        clearInterval(interval);
        reply.raw.end();
      }
    }, 1000);

    request.raw.on("close", () => clearInterval(interval));
  });
}
