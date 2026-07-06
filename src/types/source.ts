import type { SearchIntent } from './search'
import type { SellerType, SourceSpeed, VoucherType } from './voucher'

/** Raw shape every source adapter returns, before validation/normalization. See spec §28. */
export interface RawListing {
  sourceName: string
  sourceDomain: string
  sourceSpeed: SourceSpeed
  listingTitle: string
  listingUrl: string
  brand: string
  category: string
  subcategory?: string
  voucherType: VoucherType
  faceValue: number
  currency: string
  sellingPrice: number
  mandatoryFee: number
  shippingFee: number
  expiryDate?: string
  validityDays?: number
  redemptionChannel?: string
  geographicRestriction?: string
  importantTerms: string[]
  sellerName: string
  sellerType: SellerType
  availabilityText: string
  observedAt: string
  /** 1.00 = exact product URL ... 0.10 = homepage. See spec §18. */
  routingQuality: number
  /** Baseline reliability for this source before any observed-performance adjustment. See spec §17. */
  sourceReliability: number
  /**
   * Ground-truth grouping hint, set ONLY by adapters that already know it (MockSourceAdapter, for
   * demo purposes). Real adapters must leave this undefined — searchService falls back to the
   * matching engine (calculateMatchScore) to discover equivalence when it's absent, which is how
   * grouping must work once real adapters exist.
   */
  mockCanonicalVoucherId?: string
}

export interface SourceAdapter {
  id: string
  name: string
  domain: string
  search(intent: SearchIntent): Promise<RawListing[]>
  validate(url: string): Promise<boolean>
}
