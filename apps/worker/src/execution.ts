import type { Job } from "bullmq";
import { chromium, type Browser } from "playwright";
import { prisma, Prisma } from "@voucher-sor/db";
import { ExecutionRouter } from "@voucher-sor/vendor-agents";
import type { ExecutionRequest, ExecutionResult } from "@voucher-sor/shared-types";
import { logEvent, logger, type EventLogType } from "@voucher-sor/logger";
import { agentFactories } from "./vendor-agent-registry.js";

// Not currently exposed via env/config — a fixed 5% band until per-product/vendor drift tolerance
// is needed.
const DEFAULT_MAX_PRICE_DRIFT_PERCENT = 5;

let browserPromise: Promise<Browser> | null = null;
function getBrowser(): Promise<Browser> {
  browserPromise ??= chromium.launch({ headless: true });
  return browserPromise;
}

let routerPromise: Promise<ExecutionRouter> | null = null;
function getRouter(): Promise<ExecutionRouter> {
  routerPromise ??= getBrowser().then((browser) => new ExecutionRouter({ agentFactories, browser }));
  return routerPromise;
}

function eventTypeForResult(result: ExecutionResult): EventLogType {
  if (result.success) return "checkout_duration";
  switch (result.failureStage) {
    case "payment":
      return "payment_failure";
    case "extractVoucher":
    case "verify":
      return "voucher_extraction_failure";
    default:
      return "browser_crash";
  }
}

export async function processExecuteOrderJob(job: Job<{ orderId: string }>): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: job.data.orderId },
    include: { routingLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) {
    logger.warn({ orderId: job.data.orderId }, "execute-order job for missing order");
    return;
  }

  const latestLog = order.routingLogs[0];
  const vendorId = latestLog?.selectedVendorId ?? order.vendorId;
  if (!vendorId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "failed", failureReason: "No vendor selected by routing" },
    });
    return;
  }

  const [product, offer] = await Promise.all([
    prisma.product.findUniqueOrThrow({ where: { id: order.productId } }),
    prisma.offer.findUnique({ where: { vendorId_productId: { vendorId, productId: order.productId } } }),
  ]);

  await prisma.order.update({ where: { id: order.id }, data: { status: "executing" } });

  const request: ExecutionRequest = {
    orderId: order.id,
    vendorId,
    // Offer/Product don't persist the vendor's own product id (RawVendorOffer.productExternalId is
    // dropped during normalization) — product.id is the closest stable identifier until crawlers
    // start storing a per-vendor external id on Offer.
    productExternalId: product.id,
    productName: product.name,
    expectedPrice: offer ? Number(offer.price) : Number(order.sellingPrice),
    currency: offer?.currency ?? order.currency,
    maxPriceDriftPercent: DEFAULT_MAX_PRICE_DRIFT_PERCENT,
  };

  const router = await getRouter();
  const result = await router.execute(request);

  const status = result.requiredUserApproval ? "awaiting_user_approval" : result.success ? "completed" : "failed";

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      purchasePrice: result.purchasePrice,
      voucher: result.voucher ? (result.voucher as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
      executionTimeMs: result.executionTimeMs,
      failureReason: result.failureReason,
    },
  });

  if (latestLog) {
    await prisma.routingLog.update({
      where: { id: latestLog.id },
      data: { executionResult: result.requiredUserApproval ? "pending" : result.success ? "success" : "failure" },
    });
  }

  // Cumulative counters, not a strict rolling window of the last 500 (see ROLLING_WINDOW_SIZE in
  // sor-engine) — that would need an event-sourced per-order log, which is out of scope here.
  await prisma.$transaction(async (tx) => {
    const stats = await tx.vendorStats.findUnique({ where: { vendorId } });
    const totalExecutions = (stats?.totalExecutions ?? 0) + 1;
    const successfulExecutions = (stats?.successfulExecutions ?? 0) + (result.success ? 1 : 0);
    const totalOrders = (stats?.totalOrders ?? 0) + 1;
    const successfulOrders = (stats?.successfulOrders ?? 0) + (result.success ? 1 : 0);
    const previousAverage = stats?.averageCheckoutTimeMs ?? 0;
    const averageCheckoutTimeMs = Math.round(
      (previousAverage * (totalExecutions - 1) + result.executionTimeMs) / totalExecutions,
    );

    await tx.vendorStats.upsert({
      where: { vendorId },
      update: { totalExecutions, successfulExecutions, totalOrders, successfulOrders, averageCheckoutTimeMs, lastCheckoutFailed: !result.success },
      create: {
        vendorId,
        totalExecutions: 1,
        successfulExecutions: result.success ? 1 : 0,
        totalOrders: 1,
        successfulOrders: result.success ? 1 : 0,
        averageCheckoutTimeMs: result.executionTimeMs,
        lastCheckoutFailed: !result.success,
      },
    });
  });

  const eventType = eventTypeForResult(result);
  const message = result.success ? "Execution completed" : (result.failureReason ?? "Execution failed");
  logEvent(eventType, { vendorId, orderId: order.id, message, metadata: { executionTimeMs: result.executionTimeMs, failureStage: result.failureStage } });
  await prisma.eventLog.create({
    data: { type: eventType, vendorId, orderId: order.id, message, metadata: { executionTimeMs: result.executionTimeMs, failureStage: result.failureStage } },
  });
}
