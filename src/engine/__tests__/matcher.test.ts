import { describe, expect, it } from 'vitest'
import { calculateMatchScore, type MatchableAttributes } from '@/engine/matcher'

function attrs(overrides: Partial<MatchableAttributes> = {}): MatchableAttributes {
  return {
    brand: 'Starbucks',
    faceValue: 500,
    currency: 'THB',
    voucherType: 'digital',
    redemptionChannel: 'In-store and app',
    geographicRestriction: 'Thailand only',
    ...overrides,
  }
}

describe('calculateMatchScore', () => {
  it('scores the same voucher under a completely different title as an exact match (title is never used)', () => {
    // Matcher never even receives a title — proves title similarity cannot be the deciding signal (spec §11).
    const result = calculateMatchScore(attrs(), attrs())
    expect(result.label).toBe('EXACT_MATCH')
    expect(result.matchScore).toBeGreaterThanOrEqual(0.9)
    expect(result.hardMismatch).toBe(false)
  })

  it('hard-mismatches same brand with a materially different face value', () => {
    const result = calculateMatchScore(attrs({ faceValue: 500 }), attrs({ faceValue: 1000 }))
    expect(result.hardMismatch).toBe(true)
    expect(result.hardMismatchReason).toMatch(/face value/i)
    expect(result.label).toBe('NO_MATCH')
  })

  it('hard-mismatches the same face value with a different brand', () => {
    const result = calculateMatchScore(attrs({ brand: 'Starbucks', faceValue: 500 }), attrs({ brand: 'Café Amazon', faceValue: 500 }))
    expect(result.hardMismatch).toBe(true)
    expect(result.hardMismatchReason).toMatch(/brand/i)
    expect(result.label).toBe('NO_MATCH')
  })

  it('hard-mismatches digital vs. physical delivery', () => {
    const result = calculateMatchScore(attrs({ voucherType: 'digital' }), attrs({ voucherType: 'physical' }))
    expect(result.hardMismatch).toBe(true)
    expect(result.label).toBe('NO_MATCH')
  })

  it('hard-mismatches incompatible currencies', () => {
    const result = calculateMatchScore(attrs({ currency: 'THB' }), attrs({ currency: 'USD' }))
    expect(result.hardMismatch).toBe(true)
    expect(result.hardMismatchReason).toMatch(/currency|currencies/i)
  })

  it('treats an unknown voucher type as partial credit, not an automatic mismatch', () => {
    const result = calculateMatchScore(attrs({ voucherType: 'unknown' }), attrs({ voucherType: 'digital' }))
    expect(result.hardMismatch).toBe(false)
    expect(result.voucherTypeMatch).toBe(0.5)
  })

  it('gives comparable-but-not-exact scores a COMPARABLE_MATCH or lower label, never EXACT', () => {
    // Redemption channel differs (worth 10%) AND voucher type is unknown on one side (worth 15%,
    // partial credit) — enough combined softness to drop below the 0.90 EXACT_MATCH floor.
    const result = calculateMatchScore(
      attrs({ redemptionChannel: 'In-store only', voucherType: 'unknown' }),
      attrs({ redemptionChannel: 'Online only', voucherType: 'digital' }),
    )
    expect(result.matchScore).toBeLessThan(0.9)
    expect(result.label).toBe('COMPARABLE_MATCH')
  })
})
