import type { LoyaltyTier, RankingMode } from '@/types'
import { MOCK_SOURCES } from '@/data/mockSources'

const ALL_TIERS: LoyaltyTier[] = ['Silver', 'Gold', 'Platinum']

export interface SearchFilterState {
  rankingMode: RankingMode
  liveOnly: boolean
  minPrice: number | null
  maxPrice: number | null
  disabledSourceIds: Set<string>
  selectedTiers: Set<LoyaltyTier>
}

export const DEFAULT_SEARCH_FILTERS: SearchFilterState = {
  rankingMode: 'best_price',
  liveOnly: false,
  minPrice: null,
  maxPrice: null,
  disabledSourceIds: new Set(),
  selectedTiers: new Set(ALL_TIERS),
}

const RANKING_MODE_OPTIONS: Array<{ value: RankingMode; label: string }> = [
  { value: 'best_price', label: 'Best Price' },
  { value: 'best_value', label: 'Best Value' },
  { value: 'most_reliable', label: 'Most Reliable' },
]

interface SearchFiltersProps {
  filters: SearchFilterState
  onChange: (filters: SearchFilterState) => void
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  function toggleSource(sourceId: string) {
    const next = new Set(filters.disabledSourceIds)
    if (next.has(sourceId)) next.delete(sourceId)
    else next.add(sourceId)
    onChange({ ...filters, disabledSourceIds: next })
  }

  function toggleTier(tier: LoyaltyTier) {
    const next = new Set(filters.selectedTiers)
    if (next.has(tier)) next.delete(tier)
    else next.add(tier)
    onChange({ ...filters, selectedTiers: next })
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <label className="flex items-center gap-1.5 text-navy-700">
        Sort by
        <select
          value={filters.rankingMode}
          onChange={(event) => onChange({ ...filters, rankingMode: event.target.value as RankingMode })}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-accent-500 focus:outline-none"
        >
          {RANKING_MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-navy-700">
        <input type="checkbox" checked={filters.liveOnly} onChange={(event) => onChange({ ...filters, liveOnly: event.target.checked })} />
        Live only
      </label>

      <div className="flex items-center gap-1.5 text-navy-700">
        Price
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice ?? ''}
          onChange={(event) => onChange({ ...filters, minPrice: event.target.value ? Number(event.target.value) : null })}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-accent-500 focus:outline-none"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice ?? ''}
          onChange={(event) => onChange({ ...filters, maxPrice: event.target.value ? Number(event.target.value) : null })}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-accent-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1.5 text-navy-700">
        Tier
        {ALL_TIERS.map((tier) => (
          <label key={tier} className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={filters.selectedTiers.has(tier)} onChange={() => toggleTier(tier)} />
            {tier}
          </label>
        ))}
      </div>

      <details className="relative">
        <summary className="cursor-pointer list-none rounded-md border border-gray-300 px-2.5 py-1 text-navy-700 hover:border-navy-700">
          Sources ({MOCK_SOURCES.length - filters.disabledSourceIds.size}/{MOCK_SOURCES.length})
        </summary>
        <div className="thin-scrollbar absolute z-10 mt-1 max-h-64 w-64 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          {MOCK_SOURCES.map((source) => (
            <label key={source.id} className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50">
              <input type="checkbox" checked={!filters.disabledSourceIds.has(source.id)} onChange={() => toggleSource(source.id)} />
              {source.name}
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}
