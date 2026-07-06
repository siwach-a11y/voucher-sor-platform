import { clamp01 } from "./clamp.js";
import { DEFAULT_MAX_EXPECTED_CHECKOUT_TIME_MS, RISK_PENALTY_MAP, STOCK_CONFIDENCE_MAP } from "./config.js";
import type { CaptchaLevel, StockStatus } from "@voucher-sor/shared-types";

/** PriceScore = LowestPrice / VendorPrice, clamped [0,1]. Cheapest vendor always scores exactly 1.0. */
export function priceScore(vendorPrice: number, lowestPrice: number): number {
  if (vendorPrice <= 0) return 0;
  return clamp01(lowestPrice / vendorPrice);
}

/** SuccessRate = SuccessfulOrders / TotalOrders over the rolling window. Unproven vendors (0 orders) get 0, not NaN. */
export function successScore(successfulOrders: number, totalOrders: number): number {
  if (totalOrders <= 0) return 0;
  return clamp01(successfulOrders / totalOrders);
}

/** SpeedScore = 1 - (AverageCheckoutTime / MaximumExpectedTime), clamped [0,1]. */
export function speedScore(
  averageCheckoutTimeMs: number,
  maximumExpectedTimeMs: number = DEFAULT_MAX_EXPECTED_CHECKOUT_TIME_MS,
): number {
  if (maximumExpectedTimeMs <= 0) return 0;
  return clamp01(1 - averageCheckoutTimeMs / maximumExpectedTimeMs);
}

/** Stock Confidence is a direct lookup from stock status, not a continuous formula. */
export function stockConfidenceScore(status: StockStatus): number {
  return STOCK_CONFIDENCE_MAP[status];
}

/** Reliability = SuccessfulExecutions / TotalExecutions (browser-automation success, independent of order outcome). */
export function reliabilityScore(successfulExecutions: number, totalExecutions: number): number {
  if (totalExecutions <= 0) return 0;
  return clamp01(successfulExecutions / totalExecutions);
}

/** Risk Penalty is a direct lookup keyed by the worst friction observed on the vendor's last checkout. */
export function riskPenalty(level: CaptchaLevel): number {
  return RISK_PENALTY_MAP[level];
}
