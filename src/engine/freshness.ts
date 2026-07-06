import type { SourceSpeed } from '@/types'
import { hoursSince } from '@/utils/date'
import { clamp01 } from '@/utils/score'

/** Tau (decay constant, in hours) per source type — spec §13. Configurable, not hardcoded per-call. */
export const FRESHNESS_TAU: Record<SourceSpeed, number> = {
  fast_marketplace: 2,
  normal_marketplace: 8,
  official_store: 24,
}

/** FreshnessScore = exp(-AgeHours / Tau), naturally within (0, 1] for AgeHours >= 0 (spec §13). */
export function calculateFreshnessScore(lastCheckedAt: string, sourceSpeed: SourceSpeed, now: number = Date.now()): number {
  const ageHours = hoursSince(lastCheckedAt, now)
  const tau = FRESHNESS_TAU[sourceSpeed]
  return clamp01(Math.exp(-ageHours / tau))
}
