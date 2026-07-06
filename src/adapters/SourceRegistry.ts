import type { SourceAdapter } from '@/types'
import type { MockAdapterBehavior } from '@/adapters/types'
import { MockSourceAdapter } from '@/adapters/MockSourceAdapter'
import { MOCK_SOURCES } from '@/data/mockSources'

const DEFAULT_BEHAVIOR: MockAdapterBehavior = { minLatencyMs: 250, maxLatencyMs: 900, failureRate: 0.03 }

/** ClickCard Bazaar is the intentionally "flaky" source — exercises the partial-failure UI path (spec §6/§11) reliably. */
const BEHAVIOR_OVERRIDES: Record<string, Partial<MockAdapterBehavior>> = {
  clickcard: { failureRate: 0.3, maxLatencyMs: 1800 },
  truevoucher: { minLatencyMs: 150, maxLatencyMs: 400, failureRate: 0.01 },
}

/**
 * SourceRegistry (spec §28): the single place that knows which adapters exist. searchService only
 * ever calls registry.getEnabled() — nothing downstream is aware these happen to be mock adapters.
 */
class SourceRegistryImpl {
  private adapters: SourceAdapter[]
  private enabledIds: Set<string>

  constructor() {
    this.adapters = MOCK_SOURCES.map(
      (source) => new MockSourceAdapter(source.id, { ...DEFAULT_BEHAVIOR, ...BEHAVIOR_OVERRIDES[source.id] }),
    )
    this.enabledIds = new Set(this.adapters.map((a) => a.id))
  }

  getAll(): SourceAdapter[] {
    return this.adapters
  }

  getEnabled(): SourceAdapter[] {
    return this.adapters.filter((a) => this.enabledIds.has(a.id))
  }

  setEnabled(sourceId: string, enabled: boolean): void {
    if (enabled) this.enabledIds.add(sourceId)
    else this.enabledIds.delete(sourceId)
  }

  isEnabled(sourceId: string): boolean {
    return this.enabledIds.has(sourceId)
  }
}

export const SourceRegistry = new SourceRegistryImpl()
