import { describe, expect, it, vi } from 'vitest'
import { convertCurrency } from '@/data/exchangeRates'

describe('convertCurrency', () => {
  it('returns the same amount when converting a currency to itself', () => {
    expect(convertCurrency(100, 'USD', 'USD')).toBeCloseTo(100)
  })

  it('converts between two listed currencies via USD', () => {
    // 1 USD = 300 LKR and 15,800 IDR (fixed demo rates) — 300 LKR should be worth roughly 15,800 IDR.
    const result = convertCurrency(300, 'LKR', 'IDR')
    expect(result).toBeCloseTo(15800, 0)
  })

  it('is case-insensitive on currency codes', () => {
    expect(convertCurrency(1, 'usd', 'usd')).toBeCloseTo(1)
  })

  it('falls back to a 1:1 rate and warns for an unlisted currency instead of throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(convertCurrency(50, 'XYZ', 'USD')).toBe(50)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
