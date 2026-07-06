import type { VoucherPayload } from "./order.js";

/** Input handed to a vendor agent when the Execution Router launches it for one order. */
export interface ExecutionRequest {
  orderId: string;
  vendorId: string;
  productExternalId: string;
  productName: string;
  expectedPrice: number;
  currency: string;
  maxPriceDriftPercent: number;
}

export interface ExecutionResult {
  orderId: string;
  vendorId: string;
  success: boolean;
  purchasePrice: number | null;
  voucher: VoucherPayload | null;
  executionTimeMs: number;
  failureReason: string | null;
  failureStage: VendorAgentStage | null;
  requiredUserApproval: boolean;
}

export type VendorAgentStage =
  | "login"
  | "search"
  | "selectProduct"
  | "addToCart"
  | "checkout"
  | "payment"
  | "extractVoucher"
  | "verify";

/**
 * Contract every vendor's Playwright automation module must implement.
 * One instance is constructed per order, backed by a fresh BrowserContext (see BaseVendorAgent) —
 * agents must never be reused across orders and must never share cookies/sessions.
 */
export interface VendorAgent {
  readonly vendorId: string;

  login(): Promise<void>;
  search(query: string): Promise<void>;
  selectProduct(productExternalId: string): Promise<void>;
  addToCart(): Promise<void>;
  /** Throws PriceMismatchError if the live price drifts beyond maxPriceDriftPercent. */
  verifyPrice(expectedPrice: number, maxDriftPercent: number): Promise<number>;
  checkout(): Promise<void>;
  /** May resolve with requiresUserApproval=true if OTP/3-D Secure interrupts the flow. */
  payment(): Promise<{ requiresUserApproval: boolean }>;
  extractVoucher(): Promise<VoucherPayload>;
  verify(voucher: VoucherPayload): Promise<boolean>;
  returnResult(): Promise<ExecutionResult>;
  /** Releases the browser context. Must be called in a finally block by the router. */
  dispose(): Promise<void>;
}

export class PriceMismatchError extends Error {
  constructor(
    public readonly expectedPrice: number,
    public readonly actualPrice: number,
  ) {
    super(`Price drift too large: expected ${expectedPrice}, saw ${actualPrice}`);
    this.name = "PriceMismatchError";
  }
}

export class VendorAgentStepError extends Error {
  constructor(
    public readonly stage: VendorAgentStage,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "VendorAgentStepError";
  }
}
