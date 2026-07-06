import type { ConfidenceLabel, MatchLabel } from './voucher'

export type RankingMode = 'best_price' | 'best_value' | 'most_reliable'

export type RankBadge = 'BEST_PRICE' | 'BEST_VALUE' | 'MOST_RELIABLE'

export interface MatchScoreBreakdown {
  brandMatch: number
  faceValueMatch: number
  voucherTypeMatch: number
  currencyMatch: number
  redemptionCompatibility: number
  geographicCompatibility: number
  matchScore: number
  label: MatchLabel
  hardMismatch: boolean
  hardMismatchReason?: string
}

export interface ConfidenceBreakdown {
  urlConfidence: number
  priceConfidence: number
  availabilityConfidence: number
  productIdentityConfidence: number
  extractionConfidence: number
  evidenceConfidence: number
  label: ConfidenceLabel
}

export interface RankingBreakdown {
  mode: RankingMode
  priceAdvantage: number
  freshnessScore: number
  evidenceConfidence: number
  sourceReliability: number
  termQuality: number
  routingQuality: number
  baseScore: number
  availabilityMultiplier: number
  adjustedScore: number
  reasons: string[]
}

export interface RankedListing {
  listingId: string
  rank: number
  score: number
  breakdown: RankingBreakdown
  badge: RankBadge | null
}
