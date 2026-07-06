import pino from "pino";

export type EventLogType =
  | "crawl"
  | "checkout_duration"
  | "browser_crash"
  | "captcha"
  | "payment_failure"
  | "voucher_extraction_failure"
  | "routing_decision";

/** Base process logger. Each app (api/worker) should call `.child({ app: "..." })` once at startup. */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
      : undefined,
});

/**
 * Structured operational events (crawl duration, browser crashes, CAPTCHA sightings, payment/voucher
 * failures, routing decisions) — logged here AND expected to be persisted to EventLog by the caller
 * via @voucher-sor/db so the dashboard can query history, not just tail logs.
 */
export function logEvent(
  type: EventLogType,
  fields: { vendorId?: string; orderId?: string; message: string; metadata?: Record<string, unknown> },
): void {
  logger.info({ eventType: type, ...fields });
}
