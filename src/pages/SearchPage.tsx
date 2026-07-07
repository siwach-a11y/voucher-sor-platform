import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { VoucherGroup, VoucherListing } from '@/types'
import { useVoucherSearch } from '@/hooks/useVoucherSearch'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SearchBar } from '@/components/search/SearchBar'
import { CategoryTabs } from '@/components/search/CategoryTabs'
import { CountryTabs } from '@/components/search/CountryTabs'
import { SearchFilters, DEFAULT_SEARCH_FILTERS, type SearchFilterState } from '@/components/search/SearchFilters'
import { SearchSummary } from '@/components/search/SearchSummary'
import { VoucherResultList } from '@/components/vouchers/VoucherResultList'
import { VoucherDetailPanel } from '@/components/vouchers/VoucherDetailPanel'
import { EmptyResults } from '@/components/vouchers/EmptyResults'
import { Skeleton } from '@/components/common/Skeleton'
import { Drawer } from '@/components/common/Drawer'
import { buyAtStore } from '@/services/redirectService'
import { MOCK_SOURCES } from '@/data/mockSources'

const SOURCE_ID_BY_DOMAIN = new Map(MOCK_SOURCES.map((s) => [s.domain, s.id]))

function applyFilters(groups: VoucherGroup[], category: string, country: string, filters: SearchFilterState): VoucherGroup[] {
  return groups
    .filter((group) => category === 'all' || group.category === category)
    .filter((group) => country === 'all' || group.country === country)
    .map((group) => ({
      ...group,
      listings: group.listings.filter((listing) => {
        if (filters.disabledSourceIds.size > 0) {
          const sourceId = SOURCE_ID_BY_DOMAIN.get(listing.sourceDomain)
          if (sourceId && filters.disabledSourceIds.has(sourceId)) return false
        }
        if (!filters.selectedTiers.has(listing.loyaltyTier)) return false
        if (filters.liveOnly && listing.availabilityStatus !== 'LIVE') return false
        if (filters.minPrice != null && listing.totalCost < filters.minPrice) return false
        if (filters.maxPrice != null && listing.totalCost > filters.maxPrice) return false
        return true
      }),
    }))
    .filter((group) => group.listings.length > 0)
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { response, isLoading, error, hasSearched, search } = useVoucherSearch()
  const watchlist = useWatchlist()
  const isDesktop = useMediaQuery('(min-width: 1280px)')

  const [category, setCategory] = useState('all')
  const [country, setCountry] = useState('all')
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_SEARCH_FILTERS)
  const [selectedListing, setSelectedListing] = useState<VoucherListing | null>(null)
  const [buyWarning, setBuyWarning] = useState<string | null>(null)

  const initialQuery = searchParams.get('q') ?? ''

  useEffect(() => {
    if (initialQuery) void search(initialQuery)
    // Only re-run when the URL's `q` param itself changes (e.g. clicking a recent search elsewhere).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const filteredGroups = useMemo(
    () => (response ? applyFilters(response.groups, category, country, filters) : []),
    [response, category, country, filters],
  )

  const selectedGroup = selectedListing
    ? filteredGroups.find((g) => g.listings.some((l) => l.id === selectedListing.id))
    : undefined

  function handleSearch(query: string) {
    setSearchParams({ q: query })
    setSelectedListing(null)
    void search(query)
  }

  function handleBuy(listing: VoucherListing) {
    const result = buyAtStore(listing)
    setBuyWarning(result.warning)
  }

  function handleToggleWatch(group: VoucherGroup) {
    if (watchlist.isWatched(group.canonicalVoucherId)) watchlist.remove(group.canonicalVoucherId)
    else watchlist.add(group)
  }

  return (
    <div className="flex h-full">
      <div className="thin-scrollbar flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          <SearchBar initialQuery={initialQuery} onSearch={handleSearch} />

          <div className="mt-4 flex flex-col gap-3">
            <CountryTabs selected={country} onSelect={setCountry} />
            <CategoryTabs selected={category} onSelect={setCategory} />
            <SearchFilters filters={filters} onChange={setFilters} />
          </div>

          {buyWarning && (
            <div className="mt-4 rounded-md bg-stale-bg px-3 py-2 text-xs text-stale">
              {buyWarning}
              <button type="button" onClick={() => setBuyWarning(null)} className="ml-2 underline">
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-5">
            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <EmptyResults title="All sources failed to respond" description={error} />
            )}

            {!isLoading && !error && hasSearched && response && (
              <>
                <div className="mb-4">
                  <SearchSummary query={response.intent.rawQuery} meta={response.meta} />
                </div>
                {filteredGroups.length === 0 ? (
                  <EmptyResults
                    title="No verified listings match this search"
                    description="Try a different brand, face value, or relax your filters. VoucherHub never fabricates a listing to fill this space."
                  />
                ) : (
                  <VoucherResultList
                    groups={filteredGroups}
                    rankingMode={filters.rankingMode}
                    selectedListingId={selectedListing?.id ?? null}
                    onSelect={setSelectedListing}
                    onBuy={handleBuy}
                    onToggleWatch={handleToggleWatch}
                    isWatched={watchlist.isWatched}
                  />
                )}
              </>
            )}

            {!hasSearched && !isLoading && (
              <EmptyResults title="Search for a voucher to get started" description='Try "Starbucks voucher 500 Sri Lanka" or "FreshMart grocery card Indonesia".' />
            )}
          </div>
        </div>
      </div>

      {selectedListing && selectedGroup && (
        <>
          {isDesktop ? (
            <div className="w-[360px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
              <VoucherDetailPanel
                listing={selectedListing}
                group={selectedGroup}
                rankingMode={filters.rankingMode}
                onBuy={handleBuy}
                onToggleWatch={handleToggleWatch}
                isWatched={watchlist.isWatched(selectedGroup.canonicalVoucherId)}
              />
            </div>
          ) : (
            <Drawer title="Voucher details" isOpen onClose={() => setSelectedListing(null)}>
              <VoucherDetailPanel
                listing={selectedListing}
                group={selectedGroup}
                rankingMode={filters.rankingMode}
                onBuy={handleBuy}
                onToggleWatch={handleToggleWatch}
                isWatched={watchlist.isWatched(selectedGroup.canonicalVoucherId)}
              />
            </Drawer>
          )}
        </>
      )}
    </div>
  )
}
