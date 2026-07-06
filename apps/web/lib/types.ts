/**
 * Minimal local mirrors of packages/shared-types shapes, kept in sync by convention.
 * Duplicated here (rather than depending on @voucher-sor/shared-types) to keep this
 * Next.js app decoupled from the workspace's tsc build graph.
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  country: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringWeights {
  price: number;
  successRate: number;
  checkoutSpeed: number;
  stockConfidence: number;
  reliability: number;
  risk: number;
}

/** Mirrors DEFAULT_SCORING_WEIGHTS in packages/shared-types/src/scoring.ts. The offers
 * endpoint's flattened response doesn't echo weights per candidate, so we display the
 * platform's known defaults alongside each score component. */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  price: 0.35,
  successRate: 0.2,
  checkoutSpeed: 0.15,
  stockConfidence: 0.1,
  reliability: 0.1,
  risk: 0.1,
};

/** Flattened, ranked candidate returned by GET /products/:id/offers. */
export interface OfferCandidate {
  vendorId: string;
  vendorName: string;
  vendorWebsite: string;
  offerId: string;
  price: number;
  currency: string;
  estimatedDeliveryMinutes: number | null;
  priceScore: number;
  successScore: number;
  speedScore: number;
  stockConfidence: number;
  reliabilityScore: number;
  riskPenalty: number;
  finalScore: number;
}

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
