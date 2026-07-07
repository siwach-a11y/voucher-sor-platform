import type { LoyaltyTier, SellerType, VoucherType } from '@/types'

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
  country: string
  loyaltyTier: LoyaltyTier
  /** Undefined, not 0, for the handful of demo listings without a points value — 0 would falsely claim "no points offered". */
  loyaltyPoints?: number
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
  // ================= Thailand (THB) =================
  // ---- Dining: Starbucks e-Voucher THB 500 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks e-Voucher THB 500',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 455,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 2, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use', 'No cash refund'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks Digital Gift Card 500 Baht',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 465,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 3, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks Electronic Voucher ฿500',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 475,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 5, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'In-store only', geographicRestriction: 'Thailand only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks eGift 500 THB (Cheap!)',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 450,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 240, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'starbucks_500', brand: 'Starbucks', voucherName: 'Starbucks Official e-Voucher THB 500',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 490,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 15, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use', 'Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },
  // Deliberate near-miss for the matching engine: same brand, different face value — must NOT group with starbucks_500.
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'starbucks_1000', brand: 'Starbucks', voucherName: 'Starbucks e-Voucher THB 1000',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 100,
    faceValue: 1000, currency: 'THB', sellingPrice: 930,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 20, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },

  // ---- Dining: Café Amazon Voucher THB 300 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Café Amazon e-Voucher THB 300',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 272,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 10, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Cafe Amazon Digital Voucher 300 Baht',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 279,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 25, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Cafe Amazon Voucher ฿300',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 265,
    mandatoryFee: 5, shippingFee: 0, checkedMinutesAgo: 400, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'cafe_amazon_300', brand: 'Café Amazon', voucherName: 'Café Amazon Official Voucher 300 THB',
    category: 'dining', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 290,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 30, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Dining: Restaurant Dining Voucher THB 1000 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'dining_1000', brand: 'Terrace Dining Group', voucherName: 'Terrace Dining Voucher THB 1000',
    category: 'dining', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 880,
    mandatoryFee: 0, shippingFee: 50, checkedMinutesAgo: 45, availabilityText: 'limited stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'Participating restaurants', geographicRestriction: 'Bangkok metro only',
    importantTerms: ['Reservation required', 'Blackout dates apply'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'dining_1000', brand: 'Terrace Dining Group', voucherName: 'Terrace Dining Group Gift Voucher 1000 THB',
    category: 'dining', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 850,
    mandatoryFee: 0, shippingFee: 60, checkedMinutesAgo: 90, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'Participating restaurants', geographicRestriction: 'Bangkok metro only',
    importantTerms: ['Reservation required'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'dining_1000', brand: 'Terrace Dining Group', voucherName: 'Dining Voucher - Terrace Group ฿1000',
    category: 'dining', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 900,
    mandatoryFee: 20, shippingFee: 50, checkedMinutesAgo: 600, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Participating restaurants', geographicRestriction: 'Bangkok metro only',
    importantTerms: ['Reservation required', 'Blackout dates apply'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },

  // ---- Electronics: Central Plaza Gift Card THB 1000 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central Plaza Gift Card THB 1000',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 100,
    faceValue: 1000, currency: 'THB', sellingPrice: 950,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 12, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Not exchangeable for cash'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central Plaza Department Store Gift Card 1000 Baht',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 100,
    faceValue: 1000, currency: 'THB', sellingPrice: 965,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 40, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central Plaza Official Gift Card 1000 THB',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 100,
    faceValue: 1000, currency: 'THB', sellingPrice: 990,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 18, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'central_giftcard_1000', brand: 'Central Plaza', voucherName: 'Central GC 1000 - Fast Delivery',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 100,
    faceValue: 1000, currency: 'THB', sellingPrice: 920,
    mandatoryFee: 0, shippingFee: 80, checkedMinutesAgo: 720, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },

  // ---- Fashion: Urban Thread Voucher THB 500 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread e-Voucher THB 500',
    category: 'fashion', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 440,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 8, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Thailand only',
    importantTerms: ['Single use'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread Digital Gift Voucher 500 Baht',
    category: 'fashion', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 448,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 22, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread ฿500 Voucher',
    category: 'fashion', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 435,
    mandatoryFee: 10, shippingFee: 0, checkedMinutesAgo: 480, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 180, redemptionChannel: 'Online only', geographicRestriction: 'Thailand only',
    importantTerms: ['Excludes sale items'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'fashion_voucher_500', brand: 'Urban Thread', voucherName: 'Urban Thread Voucher 500THB',
    category: 'fashion', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 460,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 4, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },

  // ---- Electronics: CircuitZone Gift Card THB 2000 (physical) ----
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'electronics_giftcard_2000', brand: 'CircuitZone', voucherName: 'CircuitZone Gift Card THB 2000',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 300,
    faceValue: 2000, currency: 'THB', sellingPrice: 1880,
    mandatoryFee: 0, shippingFee: 60, checkedMinutesAgo: 14, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'electronics_giftcard_2000', brand: 'CircuitZone', voucherName: 'CircuitZone Official Gift Card 2000 THB',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 300,
    faceValue: 2000, currency: 'THB', sellingPrice: 1950,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 35, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'electronics_giftcard_2000', brand: 'CircuitZone', voucherName: 'CircuitZone GC 2000 THB - Best Deal',
    category: 'electronics', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 300,
    faceValue: 2000, currency: 'THB', sellingPrice: 1820,
    mandatoryFee: 0, shippingFee: 90, checkedMinutesAgo: 900, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Thailand only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },

  // ---- Travel: Siam Horizon Hotels Gift Voucher THB 2000 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'hotel_giftcard_2000', brand: 'Siam Horizon Hotels', voucherName: 'Siam Horizon Hotels e-Voucher THB 2000',
    category: 'travel', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 300,
    faceValue: 2000, currency: 'THB', sellingPrice: 1750,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 20, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Direct booking only', geographicRestriction: 'Thailand properties only',
    importantTerms: ['Blackout dates apply', 'Not combinable with other offers'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'hotel_giftcard_2000', brand: 'Siam Horizon Hotels', voucherName: 'Siam Horizon Digital Gift Voucher 2000 Baht',
    category: 'travel', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 300,
    faceValue: 2000, currency: 'THB', sellingPrice: 1800,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 55, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'Direct booking only', geographicRestriction: 'Thailand properties only',
    importantTerms: ['Blackout dates apply'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'hotel_giftcard_2000', brand: 'Siam Horizon Hotels', voucherName: 'Siam Horizon Hotels Official Voucher THB 2000',
    category: 'travel', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 300,
    faceValue: 2000, currency: 'THB', sellingPrice: 1900,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 60, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Direct booking only', geographicRestriction: 'Thailand properties only',
    importantTerms: ['Blackout dates apply', 'Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ---- Travel: SkyBridge Air Gift Card THB 3000 (digital) ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'airline_giftcard_3000', brand: 'SkyBridge Air', voucherName: 'SkyBridge Air Gift Card THB 3000',
    category: 'travel', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Platinum', loyaltyPoints: 600,
    faceValue: 3000, currency: 'THB', sellingPrice: 2820,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 6, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Online booking', geographicRestriction: 'Valid on domestic routes only',
    importantTerms: ['Non-refundable'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'airline_giftcard_3000', brand: 'SkyBridge Air', voucherName: 'SkyBridge Airlines E-Gift 3000 THB',
    category: 'travel', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Platinum', loyaltyPoints: 600,
    faceValue: 3000, currency: 'THB', sellingPrice: 2790,
    mandatoryFee: 15, shippingFee: 0, checkedMinutesAgo: 720, availabilityText: 'limited stock', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'Online booking', geographicRestriction: 'Valid on domestic routes only',
    importantTerms: ['Non-refundable'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'airline_giftcard_3000', brand: 'SkyBridge Air', voucherName: 'SkyBridge Air Official Gift Card 3000 THB',
    category: 'travel', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Platinum', loyaltyPoints: 600,
    faceValue: 3000, currency: 'THB', sellingPrice: 2950,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 28, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Online booking', geographicRestriction: 'Domestic and select international routes',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Travel: Andaman Adventures Activity Voucher THB 800 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'activity_voucher_800', brand: 'Andaman Adventures', voucherName: 'Andaman Adventures Activity Voucher THB 800',
    category: 'travel', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 80,
    faceValue: 800, currency: 'THB', sellingPrice: 690,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 16, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Phuket and Krabi only',
    importantTerms: ['Advance booking required'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'activity_voucher_800', brand: 'Andaman Adventures', voucherName: 'Andaman Adventures Voucher 800THB',
    category: 'travel', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 80,
    faceValue: 800, currency: 'THB', sellingPrice: 660,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 1200, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 90, redemptionChannel: 'On-site booking', geographicRestriction: 'Phuket and Krabi only',
    importantTerms: ['Advance booking required'], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'activity_voucher_800', brand: 'Andaman Adventures', voucherName: 'Andaman Adventures Experience Gift Voucher 800 Baht',
    category: 'travel', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 80,
    faceValue: 800, currency: 'THB', sellingPrice: 715,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 70, availabilityText: 'limited stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Phuket and Krabi only',
    importantTerms: ['Advance booking required'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },

  // ---- Cinema & Entertainment: StarLight Cinemas Voucher THB 400 (physical) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'StarLight Cinemas Voucher THB 400',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 40,
    faceValue: 400, currency: 'THB', sellingPrice: 340,
    mandatoryFee: 0, shippingFee: 20, checkedMinutesAgo: 5, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: ['Excludes special screenings'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'Starlight Cinema Gift Voucher 400 Baht',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 40,
    faceValue: 400, currency: 'THB', sellingPrice: 350,
    mandatoryFee: 0, shippingFee: 20, checkedMinutesAgo: 33, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'StarLight Voucher 400THB Cheap',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 40,
    faceValue: 400, currency: 'THB', sellingPrice: 320,
    mandatoryFee: 0, shippingFee: 25, checkedMinutesAgo: 300, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Box office only', geographicRestriction: 'Nationwide',
    importantTerms: ['Excludes special screenings'], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'cinema_voucher_400', brand: 'StarLight Cinemas', voucherName: 'StarLight Cinemas Official Voucher 400 THB',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 40,
    faceValue: 400, currency: 'THB', sellingPrice: 380,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 40, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Digital & Subscriptions: ReelStream Gift Card THB 300 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream Gift Card THB 300',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 265,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 3, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: ['Non-transferable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream Digital Code 300 Baht',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 270,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 18, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream ฿300 Code',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 255,
    mandatoryFee: 5, shippingFee: 0, checkedMinutesAgo: 550, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'streaming_giftcard_300', brand: 'ReelStream', voucherName: 'ReelStream Official Gift Card THB 300',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'THB', sellingPrice: 290,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 10, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Thailand account region only',
    importantTerms: ['Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ---- Gaming: PlayStation Store Gift Card THB 1000 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Store Gift Card THB 1000',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 940,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 4, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: ['Non-refundable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Gift Card 1000 Baht Digital',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 955,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 9, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PSN Card ฿1000',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 920,
    mandatoryFee: 10, shippingFee: 0, checkedMinutesAgo: 200, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Store Card 1000THB - Instant',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 905,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 1500, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'playstation_1000', brand: 'PlayStation', voucherName: 'PlayStation Official Store Gift Card 1000 THB',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'THB', sellingPrice: 985,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 25, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PlayStation Network account', geographicRestriction: 'Thailand PSN accounts only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Gaming: Steam Wallet Code THB 500 (digital) ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Wallet Code THB 500',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 465,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 2, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: ['Non-refundable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Wallet Digital Code 500 Baht',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 470,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 12, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Code ฿500 Fast',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 450,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 6, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Wallet 500THB Code',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 440,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 2000, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'steam_500', brand: 'Steam', voucherName: 'Steam Official Wallet Code 500 THB',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver', loyaltyPoints: 50,
    faceValue: 500, currency: 'THB', sellingPrice: 490,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 45, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Steam account', geographicRestriction: 'Thailand Steam accounts only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Gaming: NovaPlay Game Credits THB 300 (digital) ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'game_credits_300', brand: 'NovaPlay', voucherName: 'NovaPlay Game Credits THB 300',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver',
    faceValue: 300, currency: 'THB', sellingPrice: 275,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 7, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'NovaPlay account', geographicRestriction: 'No restriction',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'game_credits_300', brand: 'NovaPlay', voucherName: 'NovaPlay Credits 300 Baht Code',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver',
    faceValue: 300, currency: 'THB', sellingPrice: 260,
    mandatoryFee: 5, shippingFee: 0, checkedMinutesAgo: 300, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 180, redemptionChannel: 'NovaPlay account', geographicRestriction: 'No restriction',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'game_credits_300', brand: 'NovaPlay', voucherName: 'NovaPlay ฿300 Top-Up',
    category: 'gaming', voucherType: 'digital', country: 'Thailand', loyaltyTier: 'Silver',
    faceValue: 300, currency: 'THB', sellingPrice: 285,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 3, availabilityText: 'unlisted', routingQuality: 0.1,
    validityDays: 365, redemptionChannel: 'NovaPlay account', geographicRestriction: 'No restriction',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },

  // ================= Philippines (PHP) =================
  // ---- Grocery: FreshMart Grocery Card PHP 1500 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'freshmart_grocery_1500', brand: 'FreshMart', voucherName: 'FreshMart Grocery Card ₱1500',
    category: 'grocery', voucherType: 'digital', country: 'Philippines', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1500, currency: 'PHP', sellingPrice: 1380,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 9, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Philippines only',
    importantTerms: ['Single use'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'freshmart_grocery_1500', brand: 'FreshMart', voucherName: 'FreshMart Digital Grocery Card 1500 Peso',
    category: 'grocery', voucherType: 'digital', country: 'Philippines', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1500, currency: 'PHP', sellingPrice: 1400,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 26, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Philippines only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'freshmart_grocery_1500', brand: 'FreshMart', voucherName: 'FreshMart Official Grocery Card PHP 1500',
    category: 'grocery', voucherType: 'digital', country: 'Philippines', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1500, currency: 'PHP', sellingPrice: 1450,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 40, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and app', geographicRestriction: 'Philippines only',
    importantTerms: ['Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ---- Beauty & Wellness: GlowSpa Wellness Voucher PHP 800 ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'glowspa_wellness_800', brand: 'GlowSpa', voucherName: 'GlowSpa Wellness Voucher ₱800',
    category: 'beauty_wellness', voucherType: 'physical', country: 'Philippines', loyaltyTier: 'Silver', loyaltyPoints: 80,
    faceValue: 800, currency: 'PHP', sellingPrice: 720,
    mandatoryFee: 0, shippingFee: 20, checkedMinutesAgo: 33, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Metro Manila only',
    importantTerms: ['Advance booking required'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'glowspa_wellness_800', brand: 'GlowSpa', voucherName: 'GlowSpa Voucher 800 Peso',
    category: 'beauty_wellness', voucherType: 'physical', country: 'Philippines', loyaltyTier: 'Silver', loyaltyPoints: 80,
    faceValue: 800, currency: 'PHP', sellingPrice: 700,
    mandatoryFee: 10, shippingFee: 20, checkedMinutesAgo: 480, availabilityText: 'limited stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'On-site booking', geographicRestriction: 'Metro Manila only',
    importantTerms: ['Advance booking required'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'glowspa_wellness_800', brand: 'GlowSpa', voucherName: 'GlowSpa Official Wellness Voucher PHP 800',
    category: 'beauty_wellness', voucherType: 'physical', country: 'Philippines', loyaltyTier: 'Silver', loyaltyPoints: 80,
    faceValue: 800, currency: 'PHP', sellingPrice: 780,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 15, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'On-site booking', geographicRestriction: 'Metro Manila only',
    importantTerms: ['Officially issued', 'Advance booking required'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ================= Malaysia (MYR) =================
  // ---- Home & Furniture: HomeNest Furniture Voucher MYR 300 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'homenest_furniture_300', brand: 'HomeNest', voucherName: 'HomeNest Furniture Voucher RM300',
    category: 'home_furniture', voucherType: 'physical', country: 'Malaysia', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'MYR', sellingPrice: 270,
    mandatoryFee: 0, shippingFee: 15, checkedMinutesAgo: 11, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Malaysia only',
    importantTerms: ['Not exchangeable for cash'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'homenest_furniture_300', brand: 'HomeNest', voucherName: 'HomeNest Voucher 300 Ringgit - Fast Delivery',
    category: 'home_furniture', voucherType: 'physical', country: 'Malaysia', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'MYR', sellingPrice: 255,
    mandatoryFee: 0, shippingFee: 25, checkedMinutesAgo: 610, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'In-store', geographicRestriction: 'Malaysia only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'homenest_furniture_300', brand: 'HomeNest', voucherName: 'HomeNest Furniture Gift Voucher 300 MYR',
    category: 'home_furniture', voucherType: 'physical', country: 'Malaysia', loyaltyTier: 'Silver', loyaltyPoints: 30,
    faceValue: 300, currency: 'MYR', sellingPrice: 285,
    mandatoryFee: 0, shippingFee: 15, checkedMinutesAgo: 48, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Malaysia only',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },

  // ---- Electronics: TechHub Gadget Card MYR 500 ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'techhub_gadget_500', brand: 'TechHub', voucherName: 'TechHub Gadget Card RM500',
    category: 'electronics', voucherType: 'digital', country: 'Malaysia', loyaltyTier: 'Gold', loyaltyPoints: 75,
    faceValue: 500, currency: 'MYR', sellingPrice: 460,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 13, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Malaysia only',
    importantTerms: ['Single use'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'techhub_gadget_500', brand: 'TechHub', voucherName: 'TechHub Gadget Code RM500 Cheap',
    category: 'electronics', voucherType: 'digital', country: 'Malaysia', loyaltyTier: 'Gold', loyaltyPoints: 75,
    faceValue: 500, currency: 'MYR', sellingPrice: 440,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 260, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Malaysia only',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'techhub_gadget_500', brand: 'TechHub', voucherName: 'TechHub Official Gadget Card 500 MYR',
    category: 'electronics', voucherType: 'digital', country: 'Malaysia', loyaltyTier: 'Gold', loyaltyPoints: 75,
    faceValue: 500, currency: 'MYR', sellingPrice: 485,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 22, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store and online', geographicRestriction: 'Malaysia only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ================= Kenya (KES) =================
  // ---- Grocery: SavannaGrocers Card KES 5000 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'savanna_grocers_5000', brand: 'SavannaGrocers', voucherName: 'SavannaGrocers Card KES 5000',
    category: 'grocery', voucherType: 'physical', country: 'Kenya', loyaltyTier: 'Silver', loyaltyPoints: 500,
    faceValue: 5000, currency: 'KES', sellingPrice: 4600,
    mandatoryFee: 0, shippingFee: 100, checkedMinutesAgo: 17, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Kenya only',
    importantTerms: ['Not exchangeable for cash'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'savanna_grocers_5000', brand: 'SavannaGrocers', voucherName: 'SavannaGrocers Voucher 5000 Shillings',
    category: 'grocery', voucherType: 'physical', country: 'Kenya', loyaltyTier: 'Silver', loyaltyPoints: 500,
    faceValue: 5000, currency: 'KES', sellingPrice: 4500,
    mandatoryFee: 30, shippingFee: 100, checkedMinutesAgo: 500, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 180, redemptionChannel: 'In-store', geographicRestriction: 'Kenya only',
    importantTerms: [], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'savanna_grocers_5000', brand: 'SavannaGrocers', voucherName: 'SavannaGrocers Official Card KES 5000',
    category: 'grocery', voucherType: 'physical', country: 'Kenya', loyaltyTier: 'Silver', loyaltyPoints: 500,
    faceValue: 5000, currency: 'KES', sellingPrice: 4850,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 21, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Kenya only',
    importantTerms: ['Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ---- Cinema & Entertainment: SunCity Cinemas Voucher KES 1500 ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'suncity_cinema_1500', brand: 'SunCity Cinemas', voucherName: 'SunCity Cinema Voucher KES 1500',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Kenya', loyaltyTier: 'Silver', loyaltyPoints: 150,
    faceValue: 1500, currency: 'KES', sellingPrice: 1350,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 14, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: ['Excludes special screenings'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'suncity_cinema_1500', brand: 'SunCity Cinemas', voucherName: 'SunCity Cinema Voucher 1500KES - Instant',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Kenya', loyaltyTier: 'Silver', loyaltyPoints: 150,
    faceValue: 1500, currency: 'KES', sellingPrice: 1300,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 1300, availabilityText: 'sold out', routingQuality: 0.6,
    validityDays: 90, redemptionChannel: 'Box office only', geographicRestriction: 'Nationwide',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'suncity_cinema_1500', brand: 'SunCity Cinemas', voucherName: 'SunCity Cinemas Gift Voucher 1500 Shillings',
    category: 'cinema_entertainment', voucherType: 'physical', country: 'Kenya', loyaltyTier: 'Silver', loyaltyPoints: 150,
    faceValue: 1500, currency: 'KES', sellingPrice: 1420,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 60, availabilityText: 'limited stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'Box office and online', geographicRestriction: 'Nationwide',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },

  // ================= Mexico (MXN) =================
  // ---- Home & Furniture: CasaViva Home Voucher MXN 900 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'casaviva_home_900', brand: 'CasaViva', voucherName: 'CasaViva Home Voucher MXN 900',
    category: 'home_furniture', voucherType: 'physical', country: 'Mexico', loyaltyTier: 'Gold', loyaltyPoints: 135,
    faceValue: 900, currency: 'MXN', sellingPrice: 820,
    mandatoryFee: 0, shippingFee: 40, checkedMinutesAgo: 19, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Mexico only',
    importantTerms: ['Not exchangeable for cash'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'casaviva_home_900', brand: 'CasaViva', voucherName: 'CasaViva Voucher 900 Pesos',
    category: 'home_furniture', voucherType: 'physical', country: 'Mexico', loyaltyTier: 'Gold', loyaltyPoints: 135,
    faceValue: 900, currency: 'MXN', sellingPrice: 790,
    mandatoryFee: 15, shippingFee: 40, checkedMinutesAgo: 540, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 180, redemptionChannel: 'In-store', geographicRestriction: 'Mexico only',
    importantTerms: [], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'casaviva_home_900', brand: 'CasaViva', voucherName: 'CasaViva Official Home Voucher 900 MXN',
    category: 'home_furniture', voucherType: 'physical', country: 'Mexico', loyaltyTier: 'Gold', loyaltyPoints: 135,
    faceValue: 900, currency: 'MXN', sellingPrice: 880,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 24, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'Mexico only',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Travel: AeroLuna Airlines Gift Card MXN 2500 ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'aeroluna_airlines_2500', brand: 'AeroLuna Airlines', voucherName: 'AeroLuna Airlines Gift Card MXN 2500',
    category: 'travel', voucherType: 'digital', country: 'Mexico', loyaltyTier: 'Platinum', loyaltyPoints: 500,
    faceValue: 2500, currency: 'MXN', sellingPrice: 2350,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 8, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Online booking', geographicRestriction: 'Valid on domestic routes only',
    importantTerms: ['Non-refundable'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'aeroluna_airlines_2500', brand: 'AeroLuna Airlines', voucherName: 'AeroLuna E-Gift 2500 MXN Cheap',
    category: 'travel', voucherType: 'digital', country: 'Mexico', loyaltyTier: 'Platinum', loyaltyPoints: 500,
    faceValue: 2500, currency: 'MXN', sellingPrice: 2280,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 310, availabilityText: 'limited stock', routingQuality: 0.6,
    validityDays: 180, redemptionChannel: 'Online booking', geographicRestriction: 'Valid on domestic routes only',
    importantTerms: ['Non-refundable'], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'aeroluna_airlines_2500', brand: 'AeroLuna Airlines', voucherName: 'AeroLuna Airlines Official Gift Card 2500 MXN',
    category: 'travel', voucherType: 'digital', country: 'Mexico', loyaltyTier: 'Platinum', loyaltyPoints: 500,
    faceValue: 2500, currency: 'MXN', sellingPrice: 2480,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 30, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Online booking', geographicRestriction: 'Domestic and select international routes',
    importantTerms: ['Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ================= United Arab Emirates (AED) =================
  // ---- Beauty & Wellness: DesertLux Beauty Voucher AED 400 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'desertlux_beauty_400', brand: 'DesertLux', voucherName: 'DesertLux Beauty Voucher AED 400',
    category: 'beauty_wellness', voucherType: 'physical', country: 'United Arab Emirates', loyaltyTier: 'Platinum', loyaltyPoints: 120,
    faceValue: 400, currency: 'AED', sellingPrice: 370,
    mandatoryFee: 0, shippingFee: 15, checkedMinutesAgo: 27, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Dubai and Abu Dhabi only',
    importantTerms: ['Advance booking required'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'desertlux_beauty_400', brand: 'DesertLux', voucherName: 'DesertLux Wellness Voucher 400 Dirhams',
    category: 'beauty_wellness', voucherType: 'physical', country: 'United Arab Emirates', loyaltyTier: 'Platinum', loyaltyPoints: 120,
    faceValue: 400, currency: 'AED', sellingPrice: 385,
    mandatoryFee: 0, shippingFee: 15, checkedMinutesAgo: 52, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 180, redemptionChannel: 'On-site booking', geographicRestriction: 'Dubai and Abu Dhabi only',
    importantTerms: ['Advance booking required'], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'desertlux_beauty_400', brand: 'DesertLux', voucherName: 'DesertLux Official Beauty Voucher 400 AED',
    category: 'beauty_wellness', voucherType: 'physical', country: 'United Arab Emirates', loyaltyTier: 'Platinum', loyaltyPoints: 120,
    faceValue: 400, currency: 'AED', sellingPrice: 398,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 12, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'On-site booking', geographicRestriction: 'Dubai and Abu Dhabi only',
    importantTerms: ['Officially issued', 'Advance booking required'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },

  // ---- Electronics: MallCentral Gift Card AED 1000 ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'mallcentral_giftcard_1000', brand: 'MallCentral', voucherName: 'MallCentral Gift Card AED 1000',
    category: 'electronics', voucherType: 'physical', country: 'United Arab Emirates', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'AED', sellingPrice: 930,
    mandatoryFee: 0, shippingFee: 30, checkedMinutesAgo: 16, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'United Arab Emirates only',
    importantTerms: ['Not exchangeable for cash'], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'swiftcard', canonicalVoucherId: 'mallcentral_giftcard_1000', brand: 'MallCentral', voucherName: 'MallCentral GC 1000 AED - Best Deal',
    category: 'electronics', voucherType: 'physical', country: 'United Arab Emirates', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'AED', sellingPrice: 900,
    mandatoryFee: 0, shippingFee: 45, checkedMinutesAgo: 950, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'In-store', geographicRestriction: 'United Arab Emirates only',
    importantTerms: [], sellerName: 'SwiftCard Exchange Seller', sellerType: 'reseller',
  },
  {
    sourceId: 'truevoucher', canonicalVoucherId: 'mallcentral_giftcard_1000', brand: 'MallCentral', voucherName: 'MallCentral Official Gift Card 1000 AED',
    category: 'electronics', voucherType: 'physical', country: 'United Arab Emirates', loyaltyTier: 'Gold', loyaltyPoints: 150,
    faceValue: 1000, currency: 'AED', sellingPrice: 980,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 20, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 730, redemptionChannel: 'In-store', geographicRestriction: 'United Arab Emirates only',
    importantTerms: ['Officially issued'], sellerName: 'TrueVoucher Direct (Official)', sellerType: 'official',
  },

  // ================= Poland (PLN) =================
  // ---- Digital & Subscriptions: NordStream Digital Subscription PLN 60 ----
  {
    sourceId: 'giftflow', canonicalVoucherId: 'nordstream_subscription_60', brand: 'NordStream', voucherName: 'NordStream Digital Subscription PLN 60',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Poland', loyaltyTier: 'Silver',
    faceValue: 60, currency: 'PLN', sellingPrice: 54,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 5, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Poland account region only',
    importantTerms: ['Non-transferable once redeemed'], sellerName: 'GiftFlow Official', sellerType: 'marketplace',
  },
  {
    sourceId: 'promobay', canonicalVoucherId: 'nordstream_subscription_60', brand: 'NordStream', voucherName: 'NordStream Code 60 Zloty',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Poland', loyaltyTier: 'Silver',
    faceValue: 60, currency: 'PLN', sellingPrice: 52,
    mandatoryFee: 2, shippingFee: 0, checkedMinutesAgo: 560, availabilityText: 'in stock', routingQuality: 0.3,
    validityDays: 90, redemptionChannel: 'Account redemption', geographicRestriction: 'Poland account region only',
    importantTerms: ['Requires code activation before use'], sellerName: 'PromoBay Reseller', sellerType: 'reseller',
  },
  {
    sourceId: 'clickcard', canonicalVoucherId: 'nordstream_subscription_60', brand: 'NordStream', voucherName: 'NordStream Digital Code PLN 60 Fast',
    category: 'digital_subscriptions', voucherType: 'digital', country: 'Poland', loyaltyTier: 'Silver',
    faceValue: 60, currency: 'PLN', sellingPrice: 50,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 8, availabilityText: 'in stock', routingQuality: 0.6,
    validityDays: 365, redemptionChannel: 'Account redemption', geographicRestriction: 'Poland account region only',
    importantTerms: [], sellerName: 'ClickCard Bazaar Seller', sellerType: 'reseller',
  },

  // ---- Gaming: PolskaPlay Game Credits PLN 150 ----
  {
    sourceId: 'dealcrate', canonicalVoucherId: 'polskaplay_gaming_150', brand: 'PolskaPlay', voucherName: 'PolskaPlay Game Credits PLN 150',
    category: 'gaming', voucherType: 'digital', country: 'Poland', loyaltyTier: 'Gold', loyaltyPoints: 30,
    faceValue: 150, currency: 'PLN', sellingPrice: 138,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 10, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PolskaPlay account', geographicRestriction: 'No restriction',
    importantTerms: [], sellerName: 'DealCrate Seller', sellerType: 'marketplace',
  },
  {
    sourceId: 'vouchernest', canonicalVoucherId: 'polskaplay_gaming_150', brand: 'PolskaPlay', voucherName: 'PolskaPlay Credits 150 Zloty Digital',
    category: 'gaming', voucherType: 'digital', country: 'Poland', loyaltyTier: 'Gold', loyaltyPoints: 30,
    faceValue: 150, currency: 'PLN', sellingPrice: 142,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 34, availabilityText: 'in stock', routingQuality: 0.8,
    validityDays: 365, redemptionChannel: 'PolskaPlay account', geographicRestriction: 'No restriction',
    importantTerms: [], sellerName: 'VoucherNest Marketplace', sellerType: 'marketplace',
  },
  {
    sourceId: 'brandvault', canonicalVoucherId: 'polskaplay_gaming_150', brand: 'PolskaPlay', voucherName: 'PolskaPlay Official Game Credits 150 PLN',
    category: 'gaming', voucherType: 'digital', country: 'Poland', loyaltyTier: 'Gold', loyaltyPoints: 30,
    faceValue: 150, currency: 'PLN', sellingPrice: 148,
    mandatoryFee: 0, shippingFee: 0, checkedMinutesAgo: 18, availabilityText: 'in stock', routingQuality: 1.0,
    validityDays: 365, redemptionChannel: 'PolskaPlay account', geographicRestriction: 'No restriction',
    importantTerms: ['Officially issued'], sellerName: 'BrandVault Rewards (Official)', sellerType: 'official',
  },
]
