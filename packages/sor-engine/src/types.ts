import type { CaptchaLevel, StockStatus } from "@voucher-sor/shared-types";

/** Everything the SOR engine needs about one vendor's offer for one product, in one place. */
export interface ScoringCandidate {
  vendorId: string;
  offerId: string;
  price: number;
  stockStatus: StockStatus;
  averageCheckoutTimeMs: number;
  successfulOrders: number;
  totalOrders: number;
  successfulExecutions: number;
  totalExecutions: number;
  lastCaptchaLevel: CaptchaLevel;
  /** Vendor disabled or checkout currently unavailable — excluded before scoring, never just scored low. */
  eligible: boolean;
  ineligibleReason?: string;
}
