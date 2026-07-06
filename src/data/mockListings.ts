import type { SellerType, VoucherType } from '@/types'

/**
 * Template for one source's listing of one canonical voucher. `checkedMinutesAgo` is relative,
 * not an absolute timestamp — MockSourceAdapter converts it to a real `observedAt` ISO string at
 * search time (see adapters/MockSourceAdapter.ts), so freshness/availability stay meaningful
 * regardless of when the app happens to be opened.
 */
export interface MockListingTemplate {
  sourceId: string
  canonicalVoucherId: string
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
  checkedMinutesAgo: number
  /** Free-text as a source would show it — the availability engine interprets this, not the AI. */
  availabilityText: 'in stock' | 'limited stock' | 'sold out' | 'unlisted'
  routingQuality: number
  expiryDate?: string
  validityDays?: number
  redemptionChannel?: string
  geographicRestriction?: string
  importantTerms: string[]
  sellerName: string
  sellerType: SellerType
}

export const MOCK_LISTINGS: MockListingTemplate[] = [
  // ---- Food & Dining: Starbucks e-Voucher THB 500 (mirrors the worked example in the product spec) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks e-Voucher THB 500',
    category: 'food_dining', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 455,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 2, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use', 'No cash refund'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks Digital Gift Card 500 Baht',
    category: 'food_dining', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 465,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 3, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks Electronic Voucher ฿500',
    category: 'food_dining', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 475,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 5, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'In-store only', geographicRestriction: 'Thailand only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks eGift 500 THB (Cheap!)',
    category: 'food_dining', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 450,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 240, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks Official e-Voucher THB 500',
    category: 'food_dining', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 490,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 15, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use', 'Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },
  // Deliberate near-miss for the matching engine: same brand, different face value — must NOT group with starbucks_500.
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'starbucks_1000', brand: 'Starbucks', voucherName: 'Starbucks e-Voucher THB 1000',
    category: 'food_dining', voucherType: 'digital', faceValue: 1000, currency: 'THB', sellingPrice: 930,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 20, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },

  // ---- Food & Dining: Café Amazon Voucher THB 300 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Café Amazon e-Voucher THB 300',
    category: 'food_dining', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 272,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 10, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Cafe Amazon Digital Voucher 300 Baht',
    category: 'food_dining', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 279,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 25, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Cafe Amazon Voucher ฿300',
    category: 'food_dining', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 265,
    mandatoryFee: 5, shippingFee: 0, checkedMinutesAgo: 400, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Café Amazon Official Voucher 300 THB',
    category: 'food_dining', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 290,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 30, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Food & Dining: Restaurant Dining Voucher THB 1000 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'dining_1000', brand: 'Terrace Dining Group', voucherName: 'Terrace Dining Voucher THB 1000',
    category: 'food_dining', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 880,
    mandatoryFee: 0, shippingFee: 50, checkedMinutesAgo: 45, availabilityText: 'limited stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'Participating restaurants', geographicRestriction: 'Bangkok metro only',
    importantTerms: ['Reservation required', 'Blackout dates apply'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'dining_1000', brand: 'Terrace Dining Group', voucherName: 'Terrace Dining Group Gift Voucher 1000 THB',
    category: 'food_dining', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 850,
    mandatoryFee: 0, shippingFee: 60, checkedMinutesAgo: 90, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'Participating restaurants', geographicRestriction: 'Bangkok metro only',
    importantTerms: ['Reservation required'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'dining_1000', brand: 'Terrace Dining Group', voucherName: 'Dining Voucher - Terrace Group ฿1000',
    category: 'food_dining', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 900,
    mandatoryFee: 20, shippingFee: 50, checkedMinutesAgo: 600, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Participating restaurants', geographicRestriction: 'Bangkok metro only',
    importantTerms: ['Reservation required', 'Blackout dates apply'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },

  // ---- Retail: Central Department Store Gift Card THB 1000 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central Plaza Gift Card THB 1000',
    category: 'retail', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 950,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 12, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Not exchangeable for cash'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central Plaza Department Store Gift Card 1000 Baht',
    category: 'retail', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 965,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 40, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central Plaza Official Gift Card 1000 THB',
    category: 'retail', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 990,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 18, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central GC 1000 - Fast Delivery',
    category: 'retail', voucherType: 'physical', faceValue: 1000, currency: 'THB', sellingPrice: 920,
    mandatoryFee: 0, shippingFee: 80, checkedMinutesAgo: 720, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },

  // ---- Retail: Fashion Retailer Voucher THB 500 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread e-Voucher THB 500',
    category: 'retail', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 440,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 8, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread Digital Gift Voucher 500 Baht',
    category: 'retail', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 448,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 22, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread ฿500 Voucher',
    category: 'retail', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 435,
    mandatoryFee: 10, shippingFee: 0, checkedMinutesAgo: 480, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 180, redemptionChannel: 'Online only', geographicRestriction: 'Thailand only',
    importantTerms: ['Excludes sale items'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread Voucher 500THB',
    category: 'retail', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 460,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 4, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },

  // ---- Retail: Electronics Store Gift Card THB 2000 ----
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'electronics_giftcard_2000', brand: 'CircuitZone', voucherName: 'CircuitZone Gift Card THB 2000',
    category: 'retail', voucherType: 'physical', faceValue: 2000, currency: 'THB', sellingPrice: 1880,
    mandatoryFee: 0, shippingFee: 60, checkedMinutesAgo: 14, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'electronics_giftcard_2000', brand: 'CircuitZone', voucherName: 'CircuitZone Official Gift Card 2000 THB',
    category: 'retail', voucherType: 'physical', faceValue: 2000, currency: 'THB', sellingPrice: 1950,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 35, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'electronics_giftcard_2000', brand: 'CircuitZone', voucherName: 'CircuitZone GC 2000 THB - Best Deal',
    category: 'retail', voucherType: 'physical', faceValue: 2000, currency: 'THB', sellingPrice: 1820,
    mandatoryFee: 0, shippingFee: 90, checkedMinutesAgo: 900, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },

  // ---- Travel: Hotel Group Gift Voucher THB 2000 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'hotel_giftcard_2000', brand: 'Siam Horizon Hotels', voucherName: 'Siam Horizon Hotels e-Voucher THB 2000',
    category: 'travel', voucherType: 'digital', faceValue: 2000, currency: 'THB', sellingPrice: 1750,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 20, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Direct booking only', geographicRestriction: 'Thailand properties only',
    importantTerms: ['Blackout dates apply', 'Not combinable with other offers'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'hotel_giftcard_2000', brand: 'Siam Horizon Hotels', voucherName: 'Siam Horizon Digital Gift Voucher 2000 Baht',
    category: 'travel', voucherType: 'digital', faceValue: 2000, currency: 'THB', sellingPrice: 1800,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 55, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'Direct booking only', geographicRestriction: 'Thailand properties only',
    importantTerms: ['Blackout dates apply'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'hotel_giftcard_2000', brand: 'Siam Horizon Hotels', voucherName: 'Siam Horizon Hotels Official Voucher THB 2000',
    category: 'travel', voucherType: 'digital', faceValue: 2000, currency: 'THB', sellingPrice: 1900,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 60, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Direct booking only', geographicRestriction: 'Thailand properties only',
    importantTerms: ['Blackout dates apply', 'Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ---- Travel: Airline Gift Card THB 3000 (digital) ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'airline_giftcard_3000', brand: 'SkyBridge Air', voucherName: 'SkyBridge Air Gift Card THB 3000',
    category: 'travel', voucherType: 'digital', faceValue: 3000, currency: 'THB', sellingPrice: 2820,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 6, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Online booking', geographicRestriction: 'Valid on domestic routes only',
    importantTerms: ['Non-refundable'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'airline_giftcard_3000', brand: 'SkyBridge Air', voucherName: 'SkyBridge Airlines E-Gift 3000 THB',
    category: 'travel', voucherType: 'digital', faceValue: 3000, currency: 'THB', sellingPrice: 2790,
    mandatoryFee: 15, shippingFee: 0, checkedMinutesAgo: 720, availabilityText: 'limited stock', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'Online booking', geographicRestriction: 'Valid on domestic routes only',
    importantTerms: ['Non-refundable'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'airline_giftcard_3000', brand: 'SkyBridge Air', voucherName: 'SkyBridge Air Official Gift Card 3000 THB',
    category: 'travel', voucherType: 'digital', faceValue: 3000, currency: 'THB', sellingPrice: 2950,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 28, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Online booking', geographicRestriction: 'Domestic and select international routes',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Travel: Activity/Experience Voucher THB 800 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'activity_voucher_800', brand: 'Andaman Adventures', voucherName: 'Andaman Adventures Activity Voucher THB 800',
    category: 'travel', voucherType: 'physical', faceValue: 800, currency: 'THB', sellingPrice: 690,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 16, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Phuket and Krabi only',
    importantTerms: ['Advance booking required'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'activity_voucher_800', brand: 'Andaman Adventures', voucherName: 'Andaman Adventures Voucher 800THB',
    category: 'travel', voucherType: 'physical', faceValue: 800, currency: 'THB', sellingPrice: 660,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 1200, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 90, redemptionChannel: 'On-site booking', geographicRestriction: 'Phuket and Krabi only',
    importantTerms: ['Advance booking required'], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'activity_voucher_800', brand: 'Andaman Adventures', voucherName: 'Andaman Adventures Experience Gift Voucher 800 Baht',
    category: 'travel', voucherType: 'physical', faceValue: 800, currency: 'THB', sellingPrice: 715,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 70, availabilityText: 'limited stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Phuket and Krabi only',
    importantTerms: ['Advance booking required'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },

  // ---- Entertainment: Cinema Voucher THB 400 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'StarLight Cinemas Voucher THB 400',
    category: 'entertainment', voucherType: 'physical', faceValue: 400, currency: 'THB', sellingPrice: 340,
    mandatoryFee: 0, shippingFee: 20, checkedMinutesAgo: 5, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: ['Excludes special screenings'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'Starlight Cinema Gift Voucher 400 Baht',
    category: 'entertainment', voucherType: 'physical', faceValue: 400, currency: 'THB', sellingPrice: 350,
    mandatoryFee: 0, shippingFee: 20, checkedMinutesAgo: 33, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'StarLight Voucher 400THB Cheap',
    category: 'entertainment', voucherType: 'physical', faceValue: 400, currency: 'THB', sellingPrice: 320,
    mandatoryFee: 0, shippingFee: 25, checkedMinutesAgo: 300, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Box office only', geographicRestriction: 'Nationwide',
    importantTerms: ['Excludes special screenings'], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'StarLight Cinemas Official Voucher 400 THB',
    category: 'entertainment', voucherType: 'physical', faceValue: 400, currency: 'THB', sellingPrice: 380,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 40, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Entertainment: Streaming Gift Card THB 300 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream Gift Card THB 300',
    category: 'entertainment', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 265,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 3, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: ['Non-transferable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream Digital Code 300 Baht',
    category: 'entertainment', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 270,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 18, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream ฿300 Code',
    category: 'entertainment', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 255,
    mandatoryFee: 5, shippingFee: 0, checkedMinutesAgo: 550, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream Official Gift Card THB 300',
    category: 'entertainment', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 290,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 10, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: ['Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ---- Game Top-Up: PlayStation Store Gift Card THB 1000 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Store Gift Card THB 1000',
    category: 'game_topup', voucherType: 'digital', faceValue: 1000, currency: 'THB', sellingPrice: 940,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 4, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: ['Non-refundable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Gift Card 1000 Baht Digital',
    category: 'game_topup', voucherType: 'digital', faceValue: 1000, currency: 'THB', sellingPrice: 955,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 9, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PSN Card ฿1000',
    category: 'game_topup', voucherType: 'digital', faceValue: 1000, currency: 'THB', sellingPrice: 920,
    mandatoryFee: 10, shippingFee: 0, checkedMinutesAgo: 200, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Store Card 1000THB - Instant',
    category: 'game_topup', voucherType: 'digital', faceValue: 1000, currency: 'THB', sellingPrice: 905,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 1500, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Official Store Gift Card 1000 THB',
    category: 'game_topup', voucherType: 'digital', faceValue: 1000, currency: 'THB', sellingPrice: 985,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 25, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Game Top-Up: Steam Wallet Code THB 500 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Wallet Code THB 500',
    category: 'game_topup', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 465,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 2, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: ['Non-refundable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Wallet Digital Code 500 Baht',
    category: 'game_topup', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 470,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 12, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Code ฿500 Fast',
    category: 'game_topup', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 450,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 6, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Wallet 500THB Code',
    category: 'game_topup', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 440,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 2000, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Official Wallet Code 500 THB',
    category: 'game_topup', voucherType: 'digital', faceValue: 500, currency: 'THB', sellingPrice: 490,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 45, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Game Top-Up: Generic Game Credits THB 300 (digital) ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'game_credits_300', brand: 'NovaPlay', voucherName: 'NovaPlay Game Credits THB 300',
    category: 'game_topup', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 275,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 7, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'NovaPlay account', geographicRestriction: 'No restriction',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'game_credits_300', brand: 'NovaPlay', voucherName: 'NovaPlay Credits 300 Baht Code',
    category: 'game_topup', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 260,
    mandatoryFee: 5, shippingFee: 0, checkedMinutesAgo: 300, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 180, redemptionChannel: 'NovaPlay account', geographicRestriction: 'No restriction',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'game_credits_300', brand: 'NovaPlay', voucherName: 'NovaPlay ฿300 Top-Up',
    category: 'game_topup', voucherType: 'digital', faceValue: 300, currency: 'THB', sellingPrice: 285,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 3, availabilityText: 'unlisted', routingQuality: 0.1,
    validityDays: 365, redemptionChannel: 'NovaPlay account', geographicRestriction: 'No restriction',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
]
