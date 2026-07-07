import { describe, expect, it } from 'vitest'
import { parseSearchQuery } from '@/engine/queryParser'

describe('parseSearchQuery', () => {
  it('extracts brand, face value, category, and country from a query naming the market', () => {
    const intent = parseSearchQuery('Starbucks voucher 500 Thailand')
    expect(intent.brand).toBe('Starbucks')
    expect(intent.faceValue).toBe(500)
    expect(intent.category).toBe('dining')
    expect(intent.country).toBe('Thailand')
    expect(intent.currency).toBe('THB')
  })

  it('detects digital voucher type from keywords', () => {
    const intent = parseSearchQuery('PlayStation gift card 1000 baht digital')
    expect(intent.brand).toBe('PlayStation')
    expect(intent.faceValue).toBe(1000)
    expect(intent.voucherType).toBe('digital')
    expect(intent.category).toBe('gaming')
  })

  it('infers the country from a currency code even when the country name is absent', () => {
    const intent = parseSearchQuery('FreshMart grocery 1500 PHP')
    expect(intent.country).toBe('Philippines')
    expect(intent.currency).toBe('PHP')
  })

  it('does not fabricate a brand, face value, or country when none is present', () => {
    const intent = parseSearchQuery('cinema tickets')
    expect(intent.brand).toBeUndefined()
    expect(intent.faceValue).toBeUndefined()
    expect(intent.country).toBeUndefined()
  })
})
