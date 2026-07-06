export type OrderStatus =
  | "pending"
  | "routing"
  | "executing"
  | "awaiting_user_approval"
  | "paid"
  | "extracting_voucher"
  | "completed"
  | "failed"
  | "cancelled";

export interface VoucherPayload {
  code: string;
  pin: string | null;
  serialNumber: string | null;
  activationInstructions: string | null;
  expiryDate: string | null;
  /** Set once extractVoucher() output has passed verify(). */
  validated: boolean;
}

export interface Order {
  id: string;
  userId: string;
  vendorId: string | null;
  productId: string;
  status: OrderStatus;
  purchasePrice: number | null;
  sellingPrice: number;
  currency: string;
  voucher: VoucherPayload | null;
  executionTimeMs: number | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Emitted by worker → API → frontend while an order is executing, for live status UI. */
export interface OrderExecutionEvent {
  orderId: string;
  step:
    | "queued"
    | "routing_decided"
    | "browser_launched"
    | "logging_in"
    | "searching"
    | "verifying_price"
    | "adding_to_cart"
    | "checking_out"
    | "awaiting_otp"
    | "paying"
    | "extracting_voucher"
    | "verifying_voucher"
    | "completed"
    | "failed";
  message: string;
  timestamp: string;
}
