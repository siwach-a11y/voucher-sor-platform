import type { ScoreBreakdown, ScoringWeights } from '../../domain/index.js'
import type { ScoreOutput, ScoringCandidate } from './scoring.types.js'
import { DEFAULT_MAX_EXPECTED_EXECUTION_TIME_MS, DEFAULT_SCORING_WEIGHTS, validateWeights } from './scoring.config.js'
import { clamp01 } from '../../shared/index.js'

/**
 * Vendor-agnostic scoring service. Computes:
 *
 *   score = priceWeight × priceScore + successWeight × successScore + speedWeight × speedScore
 *         + reliabilityWeight × reliabilityScore − riskWeight × riskScore
 *
 * Every input is a plain number or count supplied by the caller (routing engine) — this class
 * never talks to a connector, a database, or the network.
 */
export class ScoringService {
  constructor(
    private readonly weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
    private readonly maxExpectedExecutionTimeMs: number = DEFAULT_MAX_EXPECTED_EXECUTION_TIME_MS,
  ) {
    validateWeights(weights)
  }

  /** Normalizes a raw value into a 0-1 score given its expected [min, max] range. */
  normalize(value: number, min: number, max: number): number {
    if (max <= min) return 0
    return clamp01((value - min) / (max - min))
  }

  calculate(candidate: ScoringCandidate, lowestPrice: number): ScoreOutput {
    const priceScore = candidate.price <= 0 ? 0 : clamp01(lowestPrice / candidate.price)
    const successScore = candidate.totalOrders <= 0 ? 0 : clamp01(candidate.successfulOrders / candidate.totalOrders)
    const speedScore = clamp01(1 - candidate.averageExecutionTimeMs / this.maxExpectedExecutionTimeMs)
    const reliabilityScore = candidate.totalExecutions <= 0 ? 0 : clamp01(candidate.successfulExecutions / candidate.totalExecutions)
    const riskScore = clamp01(candidate.riskLevel)

    const score =
      priceScore * this.weights.price +
      successScore * this.weights.success +
      speedScore * this.weights.speed +
      reliabilityScore * this.weights.reliability -
      riskScore * this.weights.risk

    const breakdown = { priceScore, successScore, speedScore, reliabilityScore, riskScore }
    return { score, breakdown, explanation: this.explain(candidate.connectorId, score, breakdown) }
  }

  explain(connectorId: string, score: number, breakdown: ScoreOutput['breakdown']): string {
    return (
      `Connector ${connectorId} scored ${score.toFixed(3)} ` +
      `(price=${breakdown.priceScore.toFixed(2)}×${this.weights.price}, ` +
      `success=${breakdown.successScore.toFixed(2)}×${this.weights.success}, ` +
      `speed=${breakdown.speedScore.toFixed(2)}×${this.weights.speed}, ` +
      `reliability=${breakdown.reliabilityScore.toFixed(2)}×${this.weights.reliability}, ` +
      `risk=-${breakdown.riskScore.toFixed(2)}×${this.weights.risk})`
    )
  }

  /** Scores every candidate against the lowest price in the set and sorts highest score first. */
  rank(candidates: ScoringCandidate[]): ScoreBreakdown[] {
    const priced = candidates.filter((c) => c.price > 0)
    if (priced.length === 0) return []
    const lowestPrice = Math.min(...priced.map((c) => c.price))

    return candidates
      .map((candidate) => {
        const { score, breakdown } = this.calculate(candidate, lowestPrice)
        return {
          connectorId: candidate.connectorId,
          priceScore: breakdown.priceScore,
          successScore: breakdown.successScore,
          speedScore: breakdown.speedScore,
          reliabilityScore: breakdown.reliabilityScore,
          riskScore: breakdown.riskScore,
          finalScore: score,
          weights: this.weights,
        } satisfies ScoreBreakdown
      })
      .sort((a, b) => b.finalScore - a.finalScore)
  }
}
