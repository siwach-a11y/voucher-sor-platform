import { describe, expect, it } from 'vitest'
import { calculateEvidenceConfidence, type ConfidenceInputs } from '@/engine/confidence'

function inputs(overrides: Partial<ConfidenceInputs> = {}): ConfidenceInputs {
  return {
    listingUrl: 'https://giftflow.market/starbucks/500-thb-voucher',
    routingQuality: 1,
    sellingPrice: 455,
    availabilityStatus: 'LIVE',
    brand: 'Starbucks',
    voucherName: 'Starbucks e-Voucher THB 500',
    faceValue: 500,
    sellerType: 'official',
    ...overrides,
  }
}

describe('calculateEvidenceConfidence', () => {
  it('gives a fully-verified official listing a VERY_HIGH label', () => {
    const result = calculateEvidenceConfidence(inputs())
    expect(result.label).toBe('VERY_HIGH')
    expect(result.evidenceConfidence).toBeGreaterThanOrEqual(0.9)
  })

  it('scores 0 URL confidence for an invalid URL', () => {
    const result = calculateEvidenceConfidence(inputs({ listingUrl: 'not-a-url' }))
    expect(result.urlConfidence).toBe(0)
  })

  it('drops availability confidence to 0.3 when status is UNKNOWN', () => {
    const result = calculateEvidenceConfidence(inputs({ availabilityStatus: 'UNKNOWN' }))
    expect(result.availabilityConfidence).toBe(0.3)
  })

  it('penalizes missing product identity fields', () => {
    const result = calculateEvidenceConfidence(inputs({ brand: '', faceValue: 0 }))
    expect(result.productIdentityConfidence).toBeCloseTo(1 / 3, 5)
  })

  it('gives a reseller with a homepage-only link a LOW or MEDIUM label, never VERY_HIGH', () => {
    const result = calculateEvidenceConfidence(inputs({ sellerType: 'reseller', routingQuality: 0.1, availabilityStatus: 'UNKNOWN' }))
    expect(result.label).not.toBe('VERY_HIGH')
  })
})
