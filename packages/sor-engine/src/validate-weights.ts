import type { ScoringWeights } from "@voucher-sor/shared-types";

const EPSILON = 1e-6;

/**
 * All six weights (five additive + risk penalty) should sum to 1.0 so the final score stays
 * comparable across configurations. Throws rather than silently renormalizing, since a bad
 * config file is a deploy-time bug, not a runtime condition to paper over.
 */
export function validateWeights(weights: ScoringWeights): void {
  const sum =
    weights.price + weights.successRate + weights.checkoutSpeed + weights.stockConfidence + weights.reliability + weights.risk;

  if (Math.abs(sum - 1) > EPSILON) {
    throw new Error(`ScoringWeights must sum to 1.0, got ${sum.toFixed(4)}: ${JSON.stringify(weights)}`);
  }

  for (const [key, value] of Object.entries(weights)) {
    if (value < 0) {
      throw new Error(`ScoringWeights.${key} must be >= 0, got ${value}`);
    }
  }
}
