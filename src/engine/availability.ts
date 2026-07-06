import type { AvailabilityStatus, SourceSpeed } from '@/types'
import { hoursSince } from '@/utils/date'

/** LIVE freshness threshold (hours) per source type — spec §12. Configurable per source type. */
export const LIVE_THRESHOLD_HOURS: Record<SourceSpeed, number> = {
  fast_marketplace: 0.5, // 30 minutes
  normal_marketplace: 6,
  official_store: 24,
}

const NEGATIVE_AVAILABILITY_PATTERNS = ['sold out', 'unavailable', 'removed', 'expired', 'out of stock']

function indicatesUnavailable(availabilityText: string): boolean {
  const lower = availabilityText.toLowerCase()
  return NEGATIVE_AVAILABILITY_PATTERNS.some((pattern) => lower.includes(pattern))
}

/**
 * Availability engine (spec §12): UNAVAILABLE if evidence says sold-out/removed/expired,
 * UNKNOWN if evidence is insufficient, otherwise LIVE/STALE by source-specific freshness threshold.
 * Never invents availability — a missing/empty availabilityText always yields UNKNOWN, not a guess.
 */
export function determineAvailabilityStatus(
  availabilityText: string | undefined | null,
  lastCheckedAt: string | undefined | null,
  sourceSpeed: SourceSpeed,
  now: number = Date.now(),
): AvailabilityStatus {
  if (!availabilityText || !lastCheckedAt || availabilityText.trim() === '' || availabilityText.toLowerCase() === 'unlisted') {
    return 'UNKNOWN'
  }
  if (indicatesUnavailable(availabilityText)) return 'UNAVAILABLE'

  const ageHours = hoursSince(lastCheckedAt, now)
  const threshold = LIVE_THRESHOLD_HOURS[sourceSpeed]
  return ageHours <= threshold ? 'LIVE' : 'STALE'
}

/** Ranking penalty multiplier by availability (spec: "Stale Penalty" section). */
export const AVAILABILITY_MULTIPLIER: Record<AvailabilityStatus, number> = {
  LIVE: 1.0,
  STALE: 0.6,
  UNKNOWN: 0.4,
  UNAVAILABLE: 0,
}
