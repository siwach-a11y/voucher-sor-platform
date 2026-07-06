import { describe, expect, it } from 'vitest'
import { calculateFreshnessScore } from '@/engine/freshness'

const NOW = new Date('2026-01-01T12:00:00.000Z').getTime()

function hoursAgo(hours: number): string {
  return new Date(NOW - hours * 60 * 60 * 1000).toISOString()
}

describe('calculateFreshnessScore', () => {
  it('scores a just-checked listing near 1', () => {
    expect(calculateFreshnessScore(hoursAgo(0), 'fast_marketplace', NOW)).toBeCloseTo(1, 5)
  })

  it('decays faster for fast marketplaces (tau=2) than official stores (tau=24)', () => {
    const fast = calculateFreshnessScore(hoursAgo(4), 'fast_marketplace', NOW)
    const official = calculateFreshnessScore(hoursAgo(4), 'official_store', NOW)
    expect(fast).toBeLessThan(official)
  })

  it('matches exp(-AgeHours / Tau) exactly (spec §13)', () => {
    const score = calculateFreshnessScore(hoursAgo(8), 'normal_marketplace', NOW)
    expect(score).toBeCloseTo(Math.exp(-8 / 8), 5)
  })

  it('always remains within (0, 1]', () => {
    const score = calculateFreshnessScore(hoursAgo(1000), 'fast_marketplace', NOW)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})
