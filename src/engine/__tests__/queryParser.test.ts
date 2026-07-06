import { describe, expect, it } from 'vitest'
import { parseSearchQuery } from '@/engine/queryParser'

describe('parseSearchQuery', () => {
  it('extracts brand, face value, and category from the spec §5 example', () => {
    const intent = parseSearchQuery('Starbucks voucher 500')
    expect(intent.brand).toBe('Starbucks')
    expect(intent.faceValue).toBe(500)
    expect(intent.category).toBe('food_dining')
    expect(intent.currency).toBe('THB')
  })

  it('detects digital voucher type from keywords', () => {
    const intent = parseSearchQuery('PlayStation gift card 1000 baht digital')
    expect(intent.brand).toBe('PlayStation')
    expect(intent.faceValue).toBe(1000)
    expect(intent.voucherType).toBe('digital')
    expect(intent.category).toBe('game_topup')
  })

  it('does not fabricate a brand or face value when none is present', () => {
    const intent = parseSearchQuery('cinema tickets')
    expect(intent.brand).toBeUndefined()
    expect(intent.faceValue).toBeUndefined()
  })
})
