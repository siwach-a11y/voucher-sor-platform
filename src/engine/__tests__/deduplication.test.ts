import { describe, expect, it } from 'vitest'
import { calculateDuplicateProbability, classifyDuplicate, deduplicate, type DeduplicationCandidate } from '@/engine/deduplication'

function candidate(overrides: Partial<DeduplicationCandidate> = {}): DeduplicationCandidate {
  return {
    listingUrl: 'https://giftflow.market/starbucks/500-thb-voucher',
    sourceDomain: 'giftflow.market',
    sellerName: 'GiftFlow Official',
    listingTitle: 'Starbucks e-Voucher THB 500',
    faceValue: 500,
    totalCost: 455,
    voucherType: 'digital',
    ...overrides,
  }
}

describe('calculateDuplicateProbability / classifyDuplicate', () => {
  it('classifies an identical listing seen twice as AUTO_MERGE', () => {
    const probability = calculateDuplicateProbability(candidate(), candidate())
    expect(probability).toBeGreaterThanOrEqual(0.9)
    expect(classifyDuplicate(probability)).toBe('AUTO_MERGE')
  })

  it('classifies the same listing found via a different URL path (same domain/seller, different title/price) as a soft duplicate', () => {
    const probability = calculateDuplicateProbability(
      candidate(),
      candidate({
        listingUrl: 'https://giftflow.market/deals/starbucks-500',
        listingTitle: 'Starbucks Digital Voucher 500 THB',
        totalCost: 458,
      }),
    )
    expect(classifyDuplicate(probability)).toBe('SOFT_DUPLICATE')
  })

  it('classifies genuinely different listings as KEEP_SEPARATE', () => {
    const probability = calculateDuplicateProbability(
      candidate(),
      candidate({
        listingUrl: 'https://vouchernest.com/cafe-amazon/300',
        sourceDomain: 'vouchernest.com',
        sellerName: 'VoucherNest Marketplace',
        listingTitle: 'Café Amazon Voucher THB 300',
        faceValue: 300,
        totalCost: 279,
      }),
    )
    expect(classifyDuplicate(probability)).toBe('KEEP_SEPARATE')
  })
})

describe('deduplicate', () => {
  it('merges AUTO_MERGE pairs and keeps everything else', () => {
    const items = [
      { id: 'a', ...candidate() },
      { id: 'b', ...candidate() }, // exact duplicate of a
      { id: 'c', ...candidate({ listingUrl: 'https://vouchernest.com/cafe-amazon/300', sourceDomain: 'vouchernest.com', sellerName: 'VoucherNest Marketplace', listingTitle: 'Café Amazon Voucher THB 300', faceValue: 300, totalCost: 279 }) },
    ]
    const { kept } = deduplicate(items)
    expect(kept).toHaveLength(2)
    expect(kept.some((k) => k.id === 'a' || k.id === 'b')).toBe(true)
    expect(kept.some((k) => k.id === 'c')).toBe(true)
  })
})
