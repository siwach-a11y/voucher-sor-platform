/** Everything the scoring service needs about one connector's candidacy for one product. */
export interface ScoringCandidate {
  connectorId: string
  price: number
  successfulOrders: number
  totalOrders: number
  averageExecutionTimeMs: number
  successfulExecutions: number
  totalExecutions: number
  /** 0 (no friction observed) to 1 (last run failed outright). */
  riskLevel: number
}

export interface ScoreOutput {
  score: number
  breakdown: {
    priceScore: number
    successScore: number
    speedScore: number
    reliabilityScore: number
    riskScore: number
  }
  explanation: string
}
