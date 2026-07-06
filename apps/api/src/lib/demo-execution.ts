import { prisma, Prisma } from "@voucher-sor/db";
import type { ExecutionResult, VoucherPayload } from "@voucher-sor/shared-types";
import { logEvent, logger } from "@voucher-sor/logger";

/**
 * DEMO_MODE stand-in for apps/worker's real BullMQ execution pipeline (see
 * apps/worker/src/execution.ts). The single-container demo deployment has no Redis, no worker, and
 * no Playwright/Chromium — so instead of enqueueing an execute-order job, this synthesizes a
 * successful ExecutionResult and applies the exact same Order/RoutingLog/VendorStats/EventLog
 * updates the worker would, run fire-and-forget from the orders route so the order visibly moves
 * through routing -> executing -> completed as the frontend polls, instead of jumping straight to
 * a finished state in the POST /orders response.
 */
export async function simulateExecution(params: {
  orderId: string;
  vendorId: string;
  routingLogId: string | null;
  price: number;
}): Promise<void> {
  const { orderId, vendorId, routingLogId, price } = params;

  try {
    await prisma.order.update({ where: { id: orderId }, data: { status: "executing" } });

    // Visible delay so the frontend's 2s poll has a chance to render "executing" before "completed".
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const voucher: VoucherPayload = {
      code: `DEMO-${vendorId.toUpperCase()}-${orderId.slice(-8).toUpperCase()}`,
      pin: null,
      serialNumber: null,
      activationInstructions:
        "Simulated voucher — this demo deployment has no live vendor backend connected (see DEMO_MODE).",
      expiryDate: null,
      validated: true,
    };

    const executionTimeMs = 1800 + Math.floor(Math.random() * 700);

    const result: ExecutionResult = {
      orderId,
      vendorId,
      success: true,
      purchasePrice: price,
      voucher,
      executionTimeMs,
      failureReason: null,
      failureStage: null,
      requiredUserApproval: false,
    };

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "completed",
        purchasePrice: result.purchasePrice,
        voucher: result.voucher as unknown as Prisma.InputJsonValue,
        executionTimeMs: result.executionTimeMs,
      },
    });

    if (routingLogId) {
      await prisma.routingLog.update({ where: { id: routingLogId }, data: { executionResult: "success" } });
    }

    await prisma.$transaction(async (tx) => {
      const stats = await tx.vendorStats.findUnique({ where: { vendorId } });
      const totalExecutions = (stats?.totalExecutions ?? 0) + 1;
      const successfulExecutions = (stats?.successfulExecutions ?? 0) + 1;
      const totalOrders = (stats?.totalOrders ?? 0) + 1;
      const successfulOrders = (stats?.successfulOrders ?? 0) + 1;
      const previousAverage = stats?.averageCheckoutTimeMs ?? 0;
      const averageCheckoutTimeMs = Math.round(
        (previousAverage * (totalExecutions - 1) + executionTimeMs) / totalExecutions,
      );

      await tx.vendorStats.upsert({
        where: { vendorId },
        update: { totalExecutions, successfulExecutions, totalOrders, successfulOrders, averageCheckoutTimeMs, lastCheckoutFailed: false },
        create: {
          vendorId,
          totalExecutions: 1,
          successfulExecutions: 1,
          totalOrders: 1,
          successfulOrders: 1,
          averageCheckoutTimeMs: executionTimeMs,
          lastCheckoutFailed: false,
        },
      });
    });

    logEvent("checkout_duration", {
      vendorId,
      orderId,
      message: "Simulated demo execution completed",
      metadata: { executionTimeMs },
    });
    await prisma.eventLog.create({
      data: { type: "checkout_duration", vendorId, orderId, message: "Simulated demo execution completed", metadata: { executionTimeMs } },
    });
  } catch (error) {
    logger.error({ orderId, vendorId, err: error }, "Demo execution simulation failed");
    await prisma.order
      .update({ where: { id: orderId }, data: { status: "failed", failureReason: "Demo execution simulation failed" } })
      .catch(() => {});
  }
}
