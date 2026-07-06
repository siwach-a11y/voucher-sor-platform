export type { SourceAdapter, RawListing } from '@/types'

/** Simulated network characteristics for a mock adapter — stands in for a real adapter's latency/reliability. */
export interface MockAdapterBehavior {
  minLatencyMs: number
  maxLatencyMs: number
  /** 0-1 chance this adapter's search() call rejects, exercising the "some sources failed" path (spec §6/§11). */
  failureRate: number
}
