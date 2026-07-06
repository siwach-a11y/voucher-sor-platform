import { useCallback, useState } from 'react'
import type { VoucherGroup } from '@/types'
import { addToWatchlist, getWatchlist, isWatched, removeFromWatchlist, type WatchlistItem } from '@/services/watchlistService'

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => getWatchlist())

  const add = useCallback((group: VoucherGroup) => {
    addToWatchlist(group)
    setItems(getWatchlist())
  }, [])

  const remove = useCallback((canonicalVoucherId: string) => {
    removeFromWatchlist(canonicalVoucherId)
    setItems(getWatchlist())
  }, [])

  const refresh = useCallback(() => setItems(getWatchlist()), [])

  return { items, add, remove, refresh, isWatched }
}
