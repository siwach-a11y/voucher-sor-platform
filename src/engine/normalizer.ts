import type { RawListing, VoucherListing } from '@/types'
import { calculateDiscountAmount, calculateDiscountPercent, calculateTotalCost } from '@/engine/pricing'
import { calculateFreshnessScore } from '@/engine/freshness'
import { determineAvailabilityStatus } from '@/engine/availability'
import { calculateEvidenceConfidence } from '@/engine/confidence'

let listingCounter = 0
function nextListingId(): string {
  listingCounter += 1
  return `listing_${listingCounter}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Raw evidence -> internal schema (spec §8/§9). matchConfidence is set to a neutral placeholder
 * here (1) because a listing's real match score only exists relative to a comparison group, which
 * doesn't exist until searchService groups listings — see searchService.ts, which overwrites this
 * with the real calculateMatchScore() output against each group's reference listing.
 */
export function normalizeListing(raw: RawListing): VoucherListing {
  const totalCost = calculateTotalCost(raw.sellingPrice, raw.mandatoryFee, raw.shippingFee)
  const discountAmount = calculateDiscountAmount(raw.faceValue, totalCost)
  const discountPercent = calculateDiscountPercent(raw.faceValue, totalCost)
  const availabilityStatus = determineAvailabilityStatus(raw.availabilityText, raw.observedAt, raw.sourceSpeed)
  const freshnessScore = calculateFreshnessScore(raw.observedAt, raw.sourceSpeed)

  const confidence = calculateEvidenceConfidence({
    listingUrl: raw.listingUrl,
    routingQuality: raw.routingQuality,
    sellingPrice: raw.sellingPrice,
    availabilityStatus,
    brand: raw.brand,
    voucherName: raw.listingTitle,
    faceValue: raw.faceValue,
    sellerType: raw.sellerType,
  })

  return {
    id: nextListingId(),
    brand: raw.brand,
    voucherName: raw.listingTitle,
    category: raw.category,
    subcategory: raw.subcategory,
    voucherType: raw.voucherType,
    country: raw.country,
    loyaltyTier: raw.loyaltyTier,
    loyaltyPoints: raw.loyaltyPoints,
    faceValue: raw.faceValue,
    currency: raw.currency,
    sellingPrice: raw.sellingPrice,
    mandatoryFee: raw.mandatoryFee,
    shippingFee: raw.shippingFee,
    totalCost,
    discountAmount,
    discountPercent,
    expiryDate: raw.expiryDate,
    validityDays: raw.validityDays,
    redemptionChannel: raw.redemptionChannel,
    geographicRestriction: raw.geographicRestriction,
    importantTerms: raw.importantTerms,
    sellerName: raw.sellerName,
    sellerType: raw.sellerType,
    sourceName: raw.sourceName,
    sourceDomain: raw.sourceDomain,
    sourceUrl: raw.listingUrl,
    sourceSpeed: raw.sourceSpeed,
    availabilityStatus,
    lastCheckedAt: raw.observedAt,
    evidenceConfidence: confidence.evidenceConfidence,
    matchConfidence: 1,
    priceConfidence: confidence.priceConfidence,
    sourceReliability: raw.sourceReliability,
    routingQuality: raw.routingQuality,
    freshnessScore,
  }
}
