export interface Vendor {
  id: string;
  name: string;
  website: string;
  /** Lower number = tried first when scores tie. */
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Rolling operational stats used as inputs to the SOR scoring engine. */
export interface VendorStats {
  vendorId: string;
  /** Successful orders in the rolling window (last 500). */
  successfulOrders: number;
  /** Total orders in the rolling window (last 500). */
  totalOrders: number;
  /** Successful browser-automation executions (may fail before an order is even placed). */
  successfulExecutions: number;
  totalExecutions: number;
  averageCheckoutTimeMs: number;
  lastCaptchaLevel: CaptchaLevel;
  lastCheckoutFailed: boolean;
  updatedAt: string;
}

export type CaptchaLevel = "none" | "light" | "heavy" | "otp" | "checkout_failure";
