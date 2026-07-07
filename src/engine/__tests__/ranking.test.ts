import { describe, expect, it } from 'vitest'
import { rankListings } from '@/engine/ranking'
import type { AvailabilityStatus, VoucherListing } from '@/types'

let counter = 0
function listing(overrides: Partial<VoucherListing> = {}): VoucherListing {
  counter += 1
  return {
    id: `l${counter}`,
    brand: 'Starbucks',
    voucherName: 'Starbucks e-Voucher THB 500',
    category: 'dining',
    voucherType: 'digital',
    country: 'Thailand',
    loyaltyTier: 'Silver',
    faceValue: 500,
    currency: 'THB',
    sellingPrice: 470,
    mandatoryFee: 0,
    shippingFee: 0,
    totalCost: 470,
    discountAmount: 30,
    discountPercent: 6,
    importantTerms: [],
    sellerName: 'Test Seller',
    sellerType: 'marketplace',
    sourceName: 'Test Source',
    sourceDomain: 'test.example',
    sourceUrl: 'https://test.example/listing',
    sourceSpeed: 'normal_marketplace',
    availabilityStatus: 'LIVE',
    lastCheckedAt: new Date().toISOString(),
    evidenceConfidence: 0.85,
    matchConfidence: 1,
    priceConfidence: 1,
    sourceReliability: 0.8,
    routingQuality: 1,
    freshnessScore: 0.9,
    ...overrides,
  }
}

describe('rankListings — best_price mode', () => {
  it('ranks a fresh cheap listing above a pricier one', () => {
    const cheapFresh = listing({ id: 'cheap_fresh', totalCost: 450, freshnessScore: 0.95 })
    const pricier = listing({ id: 'pricier', totalCost: 490, freshnessScore: 0.95 })
    const ranked = rankListings([cheapFresh, pricier], 'best_price')
    expect(ranked[0]!.listingId).toBe('cheap_fresh')
  })

  it('does NOT automatically rank the cheapest stale listing first, replaying the spec §3 worked example exactly', () => {
    // Store A/B/C/D from the product spec: A=455 LIVE, B=465 LIVE, C=475 LIVE, D=450 STALE (cheapest).
    const storeA = listing({ id: 'store_a', totalCost: 455, availabilityStatus: 'LIVE', freshnessScore: 0.98 })
    const storeB = listing({ id: 'store_b', totalCost: 465, availabilityStatus: 'LIVE', freshnessScore: 0.99 })
    const storeC = listing({ id: 'store_c', totalCost: 475, availabilityStatus: 'LIVE', freshnessScore: 0.99 })
    const storeD = listing({ id: 'store_d', totalCost: 450, availabilityStatus: 'STALE', freshnessScore: 0.14 })
    const ranked = rankListings([storeA, storeB, storeC, storeD], 'best_price')
    expect(ranked[0]!.listingId).toBe('store_a')
    // The cheapest listing (D) must not be the top pick precisely because it's stale.
    expect(ranked.map((r) => r.listingId)).not.toEqual(['store_d', 'store_a', 'store_b', 'store_c'])
    expect(ranked.find((r) => r.listingId === 'store_d')!.rank).toBeGreaterThan(1)
  })

  it('never lets an unavailable cheapest listing outrank a live one', () => {
    const unavailableCheapest = listing({ id: 'unavailable_cheap', totalCost: 400, availabilityStatus: 'UNAVAILABLE' })
    const live = listing({ id: 'live', totalCost: 480, availabilityStatus: 'LIVE' })
    const ranked = rankListings([unavailableCheapest, live], 'best_price')
    expect(ranked[0]!.listingId).toBe('live')
    expect(ranked.find((r) => r.listingId === 'unavailable_cheap')!.score).toBe(0)
  })
})

describe('stale penalty multiplier', () => {
  it.each<[AvailabilityStatus, number]>([
    ['LIVE', 1],
    ['STALE', 0.6],
    ['UNKNOWN', 0.4],
    ['UNAVAILABLE', 0],
  ])('applies the %s multiplier of %s to the base score', (status, multiplier) => {
    const only = listing({ id: 'only', availabilityStatus: status })
    const ranked = rankListings([only], 'best_price')
    expect(ranked[0]!.breakdown.availabilityMultiplier).toBe(multiplier)
    expect(ranked[0]!.score).toBeCloseTo(ranked[0]!.breakdown.baseScore * multiplier, 5)
  })
})

describe('rankListings — most_reliable mode', () => {
  it('can rank a more reliable, slightly pricier source above a cheaper unreliable one', () => {
    const cheapUnreliable = listing({ id: 'cheap_unreliable', totalCost: 450, sourceReliability: 0.4, evidenceConfidence: 0.65 })
    const reliablePricier = listing({ id: 'reliable_pricier', totalCost: 490, sourceReliability: 0.95, evidenceConfidence: 0.95 })
    const ranked = rankListings([cheapUnreliable, reliablePricier], 'most_reliable')
    expect(ranked[0]!.listingId).toBe('reliable_pricier')
  })
})

describe('badge eligibility', () => {
  it('never assigns a badge to an unavailable listing', () => {
    const unavailableCheapest = listing({ id: 'unavailable', totalCost: 1, availabilityStatus: 'UNAVAILABLE' })
    const live = listing({ id: 'live', totalCost: 500 })
    const ranked = rankListings([unavailableCheapest, live], 'best_price')
    expect(ranked.find((r) => r.listingId === 'unavailable')!.badge).toBeNull()
  })

  it('never assigns a badge to a low-confidence listing', () => {
    const lowConfidence = listing({ id: 'low_conf', totalCost: 1, evidenceConfidence: 0.4 })
    const normal = listing({ id: 'normal', totalCost: 500 })
    const ranked = rankListings([lowConfidence, normal], 'best_price')
    expect(ranked.find((r) => r.listingId === 'low_conf')!.badge).toBeNull()
  })
})
