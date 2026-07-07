import type { ScoringWeights } from '../../domain/index.js'

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  price: 0.35,
  success: 0.25,
  speed: 0.15,
  reliability: 0.15,
  risk: 0.1,
}

export const DEFAULT_MAX_EXPECTED_EXECUTION_TIME_MS = 30_000

const EPSILON = 1e-6

/**
 * The four additive weights (price/success/speed/reliability) plus risk should sum to 1.0 so
 * scores stay comparable across configurations. Throws rather than silently renormalizing — a bad
 * config file is a deploy-time bug, not something to paper over at runtime.
 */
export function validateWeights(weights: ScoringWeights): void {
  const sum = weights.price + weights.success + weights.speed + weights.reliability + weights.risk
  if (Math.abs(sum - 1) > EPSILON) {
    throw new Error(`ScoringWeights must sum to 1.0, got ${sum.toFixed(4)}: ${JSON.stringify(weights)}`)
  }
  for (const [key, value] of Object.entries(weights)) {
    if (value < 0) throw new Error(`ScoringWeights.${key} must be >= 0, got ${value}`)
  }
}
