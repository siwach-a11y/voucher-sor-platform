import { describe, expect, it } from 'vitest'
import { calculateDiscountAmount, calculateDiscountPercent, calculatePriceAdvantage, calculateTotalCost } from '@/engine/pricing'

describe('calculateTotalCost', () => {
  it('sums selling price, mandatory fee, and shipping', () => {
    expect(calculateTotalCost(455, 0, 0)).toBe(455)
    expect(calculateTotalCost(455, 10, 20)).toBe(485)
  })
})

describe('calculateDiscountAmount / calculateDiscountPercent', () => {
  it('matches the worked example from the product spec (§9)', () => {
    const totalCost = calculateTotalCost(455, 0, 0)
    expect(calculateDiscountAmount(500, totalCost)).toBe(45)
    expect(calculateDiscountPercent(500, totalCost)).toBeCloseTo(9, 5)
  })

  it('avoids division by zero when face value is missing/zero', () => {
    expect(calculateDiscountPercent(0, 100)).toBe(0)
  })

  it('can go negative when a listing prices above face value', () => {
    expect(calculateDiscountAmount(500, 600)).toBe(-100)
    expect(calculateDiscountPercent(500, 600)).toBeCloseTo(-20, 5)
  })
})

describe('calculatePriceAdvantage', () => {
  it('gives the cheapest listing in the group a perfect score', () => {
    expect(calculatePriceAdvantage(450, 450, 490)).toBe(1)
  })

  it('gives the most expensive listing a zero score', () => {
    expect(calculatePriceAdvantage(490, 450, 490)).toBe(0)
  })

  it('interpolates linearly between min and max', () => {
    expect(calculatePriceAdvantage(470, 450, 490)).toBeCloseTo(0.5, 5)
  })

  it('returns 1 when every comparable price is identical (spec §16)', () => {
    expect(calculatePriceAdvantage(500, 500, 500)).toBe(1)
  })

  it('always clamps to [0, 1]', () => {
    expect(calculatePriceAdvantage(1000, 450, 490)).toBe(0)
    expect(calculatePriceAdvantage(0, 450, 490)).toBe(1)
  })
})
