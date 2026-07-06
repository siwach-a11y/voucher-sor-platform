import { useCallback, useState } from 'react'
import { clearHistory, getRecentSearches, type RecentSearchRecord } from '@/services/historyService'

export function useRecentSearches(limit?: number) {
  const [records, setRecords] = useState<RecentSearchRecord[]>(() => getRecentSearches(limit))

  const refresh = useCallback(() => setRecords(getRecentSearches(limit)), [limit])

  const clear = useCallback(() => {
    clearHistory()
    setRecords([])
  }, [])

  return { records, refresh, clear }
}
