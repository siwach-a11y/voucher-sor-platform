/** Request handed to a connector's buy() once the routing engine has chosen it. */
export interface PurchaseRequest {
  orderId: string
  connectorId: string
  externalId: string
  expectedPrice: number
  currency: string
  /** Abort the purchase if the live price has drifted beyond this percentage since search(). */
  maxPriceDriftPercent: number
}

export interface PurchaseResult {
  orderId: string
  connectorId: string
  success: boolean
  purchasePrice: number | null
  /** Opaque confirmation/voucher/order-code from the vendor site — the framework never parses it. */
  confirmationCode: string | null
  executionTimeMs: number
  failureReason: string | null
  /** True when the flow paused for a human (e.g. OTP/3-D Secure) rather than failing outright. */
  requiresUserApproval: boolean
}

/** Request handed to a connector's verify() to confirm a purchase actually succeeded. */
export interface VerifyRequest {
  orderId: string
  connectorId: string
  confirmationCode: string
}

export interface VerificationResult {
  verified: boolean
  reason?: string
}
