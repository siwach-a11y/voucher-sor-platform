import { clamp01 } from '@/utils/score'

/** TotalCost = SellingPrice + MandatoryFee + ShippingFee (spec §9). */
export function calculateTotalCost(sellingPrice: number, mandatoryFee: number, shippingFee: number): number {
  return sellingPrice + mandatoryFee + shippingFee
}

/** DiscountAmount = FaceValue - TotalCost (spec §9). Can be negative if a listing is priced above face value. */
export function calculateDiscountAmount(faceValue: number, totalCost: number): number {
  return faceValue - totalCost
}

/** DiscountPercent = ((FaceValue - TotalCost) / FaceValue) × 100 (spec §9). */
export function calculateDiscountPercent(faceValue: number, totalCost: number): number {
  if (faceValue <= 0) return 0
  return ((faceValue - totalCost) / faceValue) * 100
}

/**
 * PriceAdvantage within one exact-match comparison group (spec §16):
 *   (MaxComparablePrice - ListingTotalCost) / (MaxComparablePrice - MinComparablePrice)
 * 1 if every comparable price is identical. Always clamped to [0, 1].
 */
export function calculatePriceAdvantage(listingTotalCost: number, minComparablePrice: number, maxComparablePrice: number): number {
  if (maxComparablePrice === minComparablePrice) return 1
  return clamp01((maxComparablePrice - listingTotalCost) / (maxComparablePrice - minComparablePrice))
}
