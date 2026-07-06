import { describe, expect, it } from 'vitest'
import { determineAvailabilityStatus } from '@/engine/availability'

const NOW = new Date('2026-01-01T12:00:00.000Z').getTime()

function minutesAgo(minutes: number): string {
  return new Date(NOW - minutes * 60 * 1000).toISOString()
}

describe('determineAvailabilityStatus', () => {
  it('classifies a fast marketplace listing checked 10 minutes ago as LIVE', () => {
    expect(determineAvailabilityStatus('in stock', minutesAgo(10), 'fast_marketplace', NOW)).toBe('LIVE')
  })

  it('classifies a fast marketplace listing checked 4 hours ago as STALE', () => {
    expect(determineAvailabilityStatus('in stock', minutesAgo(240), 'fast_marketplace', NOW)).toBe('STALE')
  })

  it('classifies an official-store listing checked 12 hours ago as still LIVE (24h threshold)', () => {
    expect(determineAvailabilityStatus('in stock', minutesAgo(12 * 60), 'official_store', NOW)).toBe('LIVE')
  })

  it('classifies sold-out evidence as UNAVAILABLE regardless of freshness', () => {
    expect(determineAvailabilityStatus('sold out', minutesAgo(1), 'fast_marketplace', NOW)).toBe('UNAVAILABLE')
  })

  it('classifies missing evidence as UNKNOWN rather than guessing', () => {
    expect(determineAvailabilityStatus(undefined, minutesAgo(1), 'fast_marketplace', NOW)).toBe('UNKNOWN')
    expect(determineAvailabilityStatus('unlisted', minutesAgo(1), 'fast_marketplace', NOW)).toBe('UNKNOWN')
  })
})
