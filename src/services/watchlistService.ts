import type { VoucherGroup } from '@/types'

export interface WatchlistItem {
  canonicalVoucherId: string
  brand: string
  voucherName: string
  category: string
  faceValue: number
  currency: string
  addedAt: string
  bestPrice: number
  previousBestPrice: number | null
  bestSourceName: string
  liveOfferCount: number
  lastCheckedAt: string
}

const STORAGE_KEY = 'voucherhub:watchlist'

function readAll(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : []
  } catch {
    return []
  }
}

function writeAll(items: WatchlistItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // best-effort only
  }
}

export function getWatchlist(): WatchlistItem[] {
  return readAll()
}

export function isWatched(canonicalVoucherId: string): boolean {
  return readAll().some((item) => item.canonicalVoucherId === canonicalVoucherId)
}

function summarize(group: VoucherGroup): { bestPrice: number; bestSourceName: string; liveOfferCount: number; lastCheckedAt: string } {
  const purchasable = group.listings.filter((l) => l.availabilityStatus !== 'UNAVAILABLE')
  const pool = purchasable.length > 0 ? purchasable : group.listings
  const best = pool.reduce((min, l) => (l.totalCost < min.totalCost ? l : min), pool[0]!)
  return {
    bestPrice: best.totalCost,
    bestSourceName: best.sourceName,
    liveOfferCount: group.listings.filter((l) => l.availabilityStatus === 'LIVE').length,
    lastCheckedAt: best.lastCheckedAt,
  }
}

/** ADD TO WATCHLIST (spec §25). Re-adding an already-watched voucher updates its snapshot instead of duplicating it. */
export function addToWatchlist(group: VoucherGroup): void {
  const items = readAll()
  const { bestPrice, bestSourceName, liveOfferCount, lastCheckedAt } = summarize(group)
  const existingIndex = items.findIndex((item) => item.canonicalVoucherId === group.canonicalVoucherId)

  const next: WatchlistItem = {
    canonicalVoucherId: group.canonicalVoucherId,
    brand: group.brand,
    voucherName: group.voucherName,
    category: group.category,
    faceValue: group.faceValue,
    currency: group.currency,
    addedAt: existingIndex >= 0 ? items[existingIndex]!.addedAt : new Date().toISOString(),
    bestPrice,
    previousBestPrice: existingIndex >= 0 ? items[existingIndex]!.bestPrice : null,
    bestSourceName,
    liveOfferCount,
    lastCheckedAt,
  }

  if (existingIndex >= 0) items[existingIndex] = next
  else items.push(next)
  writeAll(items)
}

export function removeFromWatchlist(canonicalVoucherId: string): void {
  writeAll(readAll().filter((item) => item.canonicalVoucherId !== canonicalVoucherId))
}

/** Refreshes stored price snapshots against freshly searched groups, preserving `previousBestPrice` for price-change display. */
export function refreshWatchlistPrices(groups: VoucherGroup[]): void {
  const items = readAll()
  if (items.length === 0) return

  const groupById = new Map(groups.map((g) => [g.canonicalVoucherId, g]))
  const updated = items.map((item) => {
    const group = groupById.get(item.canonicalVoucherId)
    if (!group) return item
    const { bestPrice, bestSourceName, liveOfferCount, lastCheckedAt } = summarize(group)
    if (bestPrice === item.bestPrice) return { ...item, lastCheckedAt }
    return { ...item, previousBestPrice: item.bestPrice, bestPrice, bestSourceName, liveOfferCount, lastCheckedAt }
  })
  writeAll(updated)
}
