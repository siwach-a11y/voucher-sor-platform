export type VoucherType = 'digital' | 'physical' | 'unknown'

export type SellerType = 'official' | 'marketplace' | 'reseller' | 'unknown'

export type AvailabilityStatus = 'LIVE' | 'STALE' | 'UNAVAILABLE' | 'UNKNOWN'

export type SourceSpeed = 'fast_marketplace' | 'normal_marketplace' | 'official_store'

export type ConfidenceLabel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW'

export type MatchLabel = 'EXACT_MATCH' | 'COMPARABLE_MATCH' | 'POSSIBLE_MATCH' | 'NO_MATCH'

/**
 * A single real listing discovered from one external source, normalized into VoucherHub's
 * internal schema. Every field here must trace back to observed source evidence — see
 * src/engine/confidence.ts and SECTION 26 (safety rules) in the product spec: never invent
 * a value that evidence doesn't support.
 */
export interface VoucherListing {
  id: string
  canonicalVoucherId?: string
  brand: string
  voucherName: string
  category: string
  subcategory?: string
  voucherType: VoucherType
  faceValue: number
  currency: string
  sellingPrice: number
  mandatoryFee: number
  shippingFee: number
  totalCost: number
  discountAmount: number
  discountPercent: number
  expiryDate?: string
  validityDays?: number
  redemptionChannel?: string
  geographicRestriction?: string
  importantTerms: string[]
  sellerName: string
  sellerType: SellerType
  sourceName: string
  sourceDomain: string
  sourceUrl: string
  sourceSpeed: SourceSpeed
  availabilityStatus: AvailabilityStatus
  lastCheckedAt: string
  evidenceConfidence: number
  matchConfidence: number
  priceConfidence: number
  sourceReliability: number
  routingQuality: number
  freshnessScore: number
  rankingScore?: number
}

/** Grouped comparison set: one canonical voucher with every comparable listing found for it. */
export interface VoucherGroup {
  canonicalVoucherId: string
  brand: string
  voucherName: string
  category: string
  faceValue: number
  currency: string
  listings: VoucherListing[]
}
