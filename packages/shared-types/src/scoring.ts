/** Weighted-scoring configuration for the Smart Order Routing engine. Must sum to 1.0 across the five positive weights (risk is a penalty, subtracted). */
export interface ScoringWeights {
  price: number;
  successRate: number;
  checkoutSpeed: number;
  stockConfidence: number;
  reliability: number;
  risk: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  price: 0.35,
  successRate: 0.2,
  checkoutSpeed: 0.15,
  stockConfidence: 0.1,
  reliability: 0.1,
  risk: 0.1,
};

/** Per-vendor breakdown of the final score, kept for dashboard display and routing-log audit trail. */
export interface ScoreBreakdown {
  vendorId: string;
  offerId: string;
  priceScore: number;
  successScore: number;
  speedScore: number;
  stockConfidence: number;
  reliabilityScore: number;
  riskPenalty: number;
  finalScore: number;
  weights: ScoringWeights;
}

export interface RoutingDecision {
  productId: string;
  candidates: ScoreBreakdown[];
  selectedVendorId: string | null;
  decisionReason: string;
  decidedAt: string;
}
