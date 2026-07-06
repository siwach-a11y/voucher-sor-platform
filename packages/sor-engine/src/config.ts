import type { CaptchaLevel } from "@voucher-sor/shared-types";
import type { StockStatus } from "@voucher-sor/shared-types";

/** Stock Confidence lookup — spec: confirmed=1.00, recently_scraped=0.80, unknown=0.50, previously_failed=0.20, out_of_stock=0. */
export const STOCK_CONFIDENCE_MAP: Record<StockStatus, number> = {
  confirmed: 1.0,
  recently_scraped: 0.8,
  unknown: 0.5,
  previously_failed: 0.2,
  out_of_stock: 0,
};

/** Risk Penalty lookup — spec: no CAPTCHA=0, light=0.20, heavy=0.50, OTP=0.80, checkout failure=1.00. */
export const RISK_PENALTY_MAP: Record<CaptchaLevel, number> = {
  none: 0,
  light: 0.2,
  heavy: 0.5,
  otp: 0.8,
  checkout_failure: 1.0,
};

/** Rolling window size for SuccessRate, per spec ("last 500 orders"). */
export const ROLLING_WINDOW_SIZE = 500;

/** Ceiling for checkout-speed normalization; vendors slower than this floor to a 0 speed score. */
export const DEFAULT_MAX_EXPECTED_CHECKOUT_TIME_MS = 30_000;
