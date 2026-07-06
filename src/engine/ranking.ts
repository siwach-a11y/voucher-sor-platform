import type { AvailabilityStatus, RankBadge, RankedListing, RankingBreakdown, RankingMode, VoucherListing } from '@/types'
import { AVAILABILITY_MULTIPLIER } from '@/engine/availability'
import { calculatePriceAdvantage } from '@/engine/pricing'
import { clamp01, weightedSum } from '@/utils/score'

const CONFIDENCE_BADGE_FLOOR = 0.65 // matches the confidence engine's LOW threshold
const MATCH_BADGE_FLOOR = 0.75 // matches the matcher's COMPARABLE_MATCH threshold

/**
 * TermQuality is not given an explicit formula in the product spec (only used as a BestValueScore
 * component) — this is a documented, deterministic heuristic: longer validity and fewer
 * restrictive terms score higher. Still fully arithmetic, no AI involvement (spec §27).
 */
export function calculateTermQuality(validityDays: number | undefined, importantTerms: string[]): number {
  const validityComponent = validityDays ? clamp01(validityDays / 365) : 0.3
  const restrictionPenalty = clamp01(importantTerms.length / 5)
  return clamp01(0.5 + validityComponent * 0.3 - restrictionPenalty * 0.3)
}

interface RankingComponents {
  priceAdvantage: number
  freshnessScore: number
  evidenceConfidence: number
  sourceReliability: number
  termQuality: number
  routingQuality: number
  availabilityStatus: AvailabilityStatus
}

function scoreForMode(mode: RankingMode, c: RankingComponents): number {
  switch (mode) {
    case 'best_price':
      return weightedSum([
        [c.priceAdvantage, 0.7],
        [c.freshnessScore, 0.15],
        [c.evidenceConfidence, 0.15],
      ])
    case 'best_value':
      return weightedSum([
        [c.priceAdvantage, 0.4],
        [c.freshnessScore, 0.2],
        [c.evidenceConfidence, 0.15],
        [c.sourceReliability, 0.15],
        [c.termQuality, 0.1],
      ])
    case 'most_reliable':
      return weightedSum([
        [c.sourceReliability, 0.4],
        [c.evidenceConfidence, 0.25],
        [c.freshnessScore, 0.2],
        [c.routingQuality, 0.15],
      ])
  }
}

function reasonsFor(mode: RankingMode, c: RankingComponents, listing: VoucherListing, isCheapest: boolean): string[] {
  const reasons: string[] = []
  if (mode === 'most_reliable' && c.sourceReliability >= 0.85) reasons.push('Ranked by source reliability, not price, in this view')
  if (c.priceAdvantage >= 0.85) reasons.push(isCheapest ? 'Lowest verified total cost in this comparison' : 'Strong price advantage vs. comparable offers')
  if (c.freshnessScore >= 0.8) reasons.push('Recently verified availability check')
  if (c.evidenceConfidence >= 0.8) reasons.push('High-confidence source evidence')
  if (c.sourceReliability >= 0.8) reasons.push('High historical source reliability')
  if (c.routingQuality >= 1) reasons.push('Direct link to the exact product listing')
  if (listing.sellerType === 'official') reasons.push('Sold directly by the official brand store')
  if (c.availabilityStatus === 'STALE') reasons.push('Availability check is stale — price may have changed')
  if (c.availabilityStatus === 'UNAVAILABLE') reasons.push('Source currently reports this listing as unavailable')
  if (reasons.length === 0) reasons.push('Meets the match and evidence thresholds for this comparison group')
  return reasons
}

/**
 * Ranks one comparison group's listings under a given mode (spec §15), applying the stale/
 * unavailable penalty multiplier (spec "Stale Penalty" section) after the base weighted score.
 * UNAVAILABLE listings always sink to the bottom (multiplier 0) but are never hidden — see spec §26.
 */
export function rankListings(listings: VoucherListing[], mode: RankingMode): RankedListing[] {
  if (listings.length === 0) return []

  const totalCosts = listings.map((l) => l.totalCost)
  const minCost = Math.min(...totalCosts)
  const maxCost = Math.max(...totalCosts)

  const scored = listings.map((listing) => {
    const priceAdvantage = calculatePriceAdvantage(listing.totalCost, minCost, maxCost)
    const termQuality = calculateTermQuality(listing.validityDays, listing.importantTerms)
    const components: RankingComponents = {
      priceAdvantage,
      freshnessScore: listing.freshnessScore,
      evidenceConfidence: listing.evidenceConfidence,
      sourceReliability: listing.sourceReliability,
      termQuality,
      routingQuality: listing.routingQuality,
      availabilityStatus: listing.availabilityStatus,
    }

    const baseScore = scoreForMode(mode, components)
    const availabilityMultiplier = AVAILABILITY_MULTIPLIER[listing.availabilityStatus]
    const adjustedScore = baseScore * availabilityMultiplier

    const breakdown: RankingBreakdown = {
      mode,
      priceAdvantage,
      freshnessScore: components.freshnessScore,
      evidenceConfidence: components.evidenceConfidence,
      sourceReliability: components.sourceReliability,
      termQuality,
      routingQuality: components.routingQuality,
      baseScore,
      availabilityMultiplier,
      adjustedScore,
      reasons: reasonsFor(mode, components, listing, listing.totalCost === minCost),
    }

    return { listing, breakdown }
  })

  scored.sort((a, b) => b.breakdown.adjustedScore - a.breakdown.adjustedScore)

  const badgeMap = computeBadges(listings)

  return scored.map(({ listing, breakdown }, index) => ({
    listingId: listing.id,
    rank: index + 1,
    score: breakdown.adjustedScore,
    breakdown,
    badge: badgeMap.get(listing.id) ?? null,
  }))
}

/**
 * Computes, per comparison group, which single listing wins each ranking mode (spec §22/§23:
 * "BEST PRICE" / "BEST VALUE" / "MOST RELIABLE" badges), independent of whichever mode the user is
 * currently viewing. A listing can only ever carry one badge, priced in that priority order, and
 * ineligible listings (unavailable, low confidence, weak match) never receive one — spec §15/§23.
 */
export function computeBadges(listings: VoucherListing[]): Map<string, RankBadge> {
  const eligible = listings.filter(
    (l) => l.availabilityStatus !== 'UNAVAILABLE' && l.evidenceConfidence >= CONFIDENCE_BADGE_FLOOR && l.matchConfidence >= MATCH_BADGE_FLOOR,
  )

  const badgeMap = new Map<string, RankBadge>()
  if (eligible.length === 0) return badgeMap

  const modes: Array<[RankingMode, RankBadge]> = [
    ['best_price', 'BEST_PRICE'],
    ['best_value', 'BEST_VALUE'],
    ['most_reliable', 'MOST_RELIABLE'],
  ]

  for (const [mode, badge] of modes) {
    const ranked = rankListingsWithoutBadges(eligible, mode)
    const winner = ranked[0]
    if (winner && !badgeMap.has(winner.listingId)) {
      badgeMap.set(winner.listingId, badge)
    }
  }

  return badgeMap
}

/** Internal helper — same scoring as rankListings but skips badge computation to avoid infinite recursion. */
function rankListingsWithoutBadges(listings: VoucherListing[], mode: RankingMode): Array<{ listingId: string; score: number }> {
  const totalCosts = listings.map((l) => l.totalCost)
  const minCost = Math.min(...totalCosts)
  const maxCost = Math.max(...totalCosts)

  return listings
    .map((listing) => {
      const priceAdvantage = calculatePriceAdvantage(listing.totalCost, minCost, maxCost)
      const termQuality = calculateTermQuality(listing.validityDays, listing.importantTerms)
      const baseScore = scoreForMode(mode, {
        priceAdvantage,
        freshnessScore: listing.freshnessScore,
        evidenceConfidence: listing.evidenceConfidence,
        sourceReliability: listing.sourceReliability,
        termQuality,
        routingQuality: listing.routingQuality,
        availabilityStatus: listing.availabilityStatus,
      })
      const adjustedScore = baseScore * AVAILABILITY_MULTIPLIER[listing.availabilityStatus]
      return { listingId: listing.id, score: adjustedScore }
    })
    .sort((a, b) => b.score - a.score)
}
