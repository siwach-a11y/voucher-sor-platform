import { useCallback, useState } from 'react'
import type { SearchResponse } from '@/types'
import { search as runSearch } from '@/services/searchService'
import { recordSearch } from '@/services/historyService'
import { refreshWatchlistPrices } from '@/services/watchlistService'
import { evaluateAlerts } from '@/services/priceAlertService'

export interface UseVoucherSearchState {
  response: SearchResponse | null
  isLoading: boolean
  error: string | null
  hasSearched: boolean
}

export function useVoucherSearch() {
  const [state, setState] = useState<UseVoucherSearchState>({ response: null, isLoading: false, error: null, hasSearched: false })

  const search = useCallback(async (query: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const response = await runSearch(query)
      recordSearch(query, response.meta.resultsFound)
      refreshWatchlistPrices(response.groups)
      evaluateAlerts(response.groups)
      setState({ response, isLoading: false, error: null, hasSearched: true })
    } catch (error) {
      setState({
        response: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed unexpectedly.',
        hasSearched: true,
      })
    }
  }, [])

  return { ...state, search }
}
