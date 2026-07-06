import type { RoutingDecision, ScoreBreakdown, ScoringWeights } from "@voucher-sor/shared-types";
import { DEFAULT_SCORING_WEIGHTS } from "@voucher-sor/shared-types";
import { priceScore, reliabilityScore, riskPenalty, speedScore, stockConfidenceScore, successScore } from "./scores.js";
import type { ScoringCandidate } from "./types.js";
import { DEFAULT_MAX_EXPECTED_CHECKOUT_TIME_MS } from "./config.js";
import { validateWeights } from "./validate-weights.js";

export * from "./scores.js";
export * from "./config.js";
export * from "./clamp.js";
export * from "./types.js";
export { validateWeights };

export interface ScoreOfferOptions {
  weights?: ScoringWeights;
  maximumExpectedCheckoutTimeMs?: number;
}

/**
 * Final Score = PriceScore*W1 + SuccessScore*W2 + SpeedScore*W3 + StockConfidence*W4 + Reliability*W5 - RiskPenalty*W6
 * `lowestPrice` must be the minimum price across ALL eligible candidates for this product, computed by the caller
 * (rankOffers does this automatically) — never the candidate's own price.
 */
export function scoreOffer(candidate: ScoringCandidate, lowestPrice: number, options: ScoreOfferOptions = {}): ScoreBreakdown {
  const weights = options.weights ?? DEFAULT_SCORING_WEIGHTS;
  const maxCheckoutTime = options.maximumExpectedCheckoutTimeMs ?? DEFAULT_MAX_EXPECTED_CHECKOUT_TIME_MS;

  const priceScoreValue = priceScore(candidate.price, lowestPrice);
  const successScoreValue = successScore(candidate.successfulOrders, candidate.totalOrders);
  const speedScoreValue = speedScore(candidate.averageCheckoutTimeMs, maxCheckoutTime);
  const stockConfidenceValue = stockConfidenceScore(candidate.stockStatus);
  const reliabilityScoreValue = reliabilityScore(candidate.successfulExecutions, candidate.totalExecutions);
  const riskPenaltyValue = riskPenalty(candidate.lastCaptchaLevel);

  const finalScore =
    priceScoreValue * weights.price +
    successScoreValue * weights.successRate +
    speedScoreValue * weights.checkoutSpeed +
    stockConfidenceValue * weights.stockConfidence +
    reliabilityScoreValue * weights.reliability -
    riskPenaltyValue * weights.risk;

  return {
    vendorId: candidate.vendorId,
    offerId: candidate.offerId,
    priceScore: priceScoreValue,
    successScore: successScoreValue,
    speedScore: speedScoreValue,
    stockConfidence: stockConfidenceValue,
    reliabilityScore: reliabilityScoreValue,
    riskPenalty: riskPenaltyValue,
    finalScore,
    weights,
  };
}

/** Scores every eligible candidate for a product and sorts highest score first. Ineligible candidates are dropped, not scored. */
export function rankOffers(candidates: ScoringCandidate[], options: ScoreOfferOptions = {}): ScoreBreakdown[] {
  const eligible = candidates.filter((c) => c.eligible && c.stockStatus !== "out_of_stock");
  if (eligible.length === 0) return [];

  const lowestPrice = Math.min(...eligible.map((c) => c.price));
  return eligible.map((c) => scoreOffer(c, lowestPrice, options)).sort((a, b) => b.finalScore - a.finalScore);
}

/**
 * Full routing decision for one product: ranks every candidate, picks the top score, and records
 * a human-readable reason for the audit trail (RoutingLog.decisionReason).
 */
export function decideRoute(productId: string, candidates: ScoringCandidate[], options: ScoreOfferOptions = {}): RoutingDecision {
  if (options.weights) validateWeights(options.weights);

  const ranked = rankOffers(candidates, options);
  const ineligible = candidates.filter((c) => !c.eligible || c.stockStatus === "out_of_stock");

  if (ranked.length === 0) {
    return {
      productId,
      candidates: ranked,
      selectedVendorId: null,
      decisionReason: `No eligible vendors. ${ineligible.length} candidate(s) excluded (disabled, checkout unavailable, or out of stock).`,
      decidedAt: new Date().toISOString(),
    };
  }

  const winner = ranked[0]!;
  const runnerUp = ranked[1];
  const margin = runnerUp ? (winner.finalScore - runnerUp.finalScore).toFixed(3) : "n/a";
  const decisionReason = runnerUp
    ? `Vendor ${winner.vendorId} selected with score ${winner.finalScore.toFixed(3)} ` +
      `(price=${winner.priceScore.toFixed(2)}, success=${winner.successScore.toFixed(2)}, speed=${winner.speedScore.toFixed(2)}, ` +
      `stock=${winner.stockConfidence.toFixed(2)}, reliability=${winner.reliabilityScore.toFixed(2)}, risk=-${winner.riskPenalty.toFixed(2)}), ` +
      `beating runner-up ${runnerUp.vendorId} (${runnerUp.finalScore.toFixed(3)}) by ${margin}.`
    : `Vendor ${winner.vendorId} selected with score ${winner.finalScore.toFixed(3)} — sole eligible candidate.`;

  return {
    productId,
    candidates: ranked,
    selectedVendorId: winner.vendorId,
    decisionReason,
    decidedAt: new Date().toISOString(),
  };
}
