/** Weighted-scoring configuration for the routing engine. The five weights should sum to 1.0 so
 * scores stay comparable across configurations — see config/ for how these are loaded. */
export interface ScoringWeights {
  price: number
  success: number
  speed: number
  reliability: number
  risk: number
}

/** Per-connector breakdown of one score, kept for audit trail / "why this ranks here" UI. */
export interface ScoreBreakdown {
  connectorId: string
  priceScore: number
  successScore: number
  speedScore: number
  reliabilityScore: number
  riskScore: number
  finalScore: number
  weights: ScoringWeights
}

export interface RoutingDecision {
  productId: string
  candidates: ScoreBreakdown[]
  selectedConnectorId: string | null
  reason: string
  decidedAt: string
}
