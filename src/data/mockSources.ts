import type { SourceSpeed } from '@/types'

export interface MockSourceDefinition {
  id: string
  name: string
  domain: string
  speed: SourceSpeed
  /** Baseline SourceReliability (spec §17) — for mock data this stands in for observed-performance history. */
  reliability: number
}

/**
 * Fictional source names only — see spec §6. These do not represent real marketplaces or
 * real-time integrations; they exist to exercise the multi-source discovery/ranking pipeline.
 */
export const MOCK_SOURCES: MockSourceDefinition[] = [
  { id: 'giftflow', name: 'GiftFlow Market', domain: 'giftflow.market', speed: 'fast_marketplace', reliability: 0.78 },
  { id: 'dealcrate', name: 'DealCrate', domain: 'dealcrate.co', speed: 'fast_marketplace', reliability: 0.7 },
  { id: 'vouchernest', name: 'VoucherNest', domain: 'vouchernest.com', speed: 'normal_marketplace', reliability: 0.85 },
  { id: 'promobay', name: 'PromoBay', domain: 'promobay.io', speed: 'normal_marketplace', reliability: 0.62 },
  { id: 'swiftcard', name: 'SwiftCard Exchange', domain: 'swiftcard.exchange', speed: 'normal_marketplace', reliability: 0.58 },
  { id: 'truevoucher', name: 'TrueVoucher Direct', domain: 'truevoucher.direct', speed: 'official_store', reliability: 0.95 },
  { id: 'brandvault', name: 'BrandVault Rewards', domain: 'brandvault.rewards', speed: 'official_store', reliability: 0.9 },
  { id: 'clickcard', name: 'ClickCard Bazaar', domain: 'clickcard.bazaar', speed: 'fast_marketplace', reliability: 0.5 },
]

export function getMockSource(id: string): MockSourceDefinition {
  const source = MOCK_SOURCES.find((s) => s.id === id)
  if (!source) throw new Error(`Unknown mock source id: ${id}`)
  return source
}
