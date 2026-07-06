import type { VoucherListing } from '@/types'
import { isValidUrl } from '@/utils/url'

export interface OutboundClickRecord {
  listingId: string
  brand: string
  voucherName: string
  sourceName: string
  sourceUrl: string
  routingQuality: number
  clickedAt: string
}

const STORAGE_KEY = 'voucherhub:outboundClicks'
const MAX_RECORDS = 200

export function getOutboundClicks(): OutboundClickRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as OutboundClickRecord[]) : []
  } catch {
    return []
  }
}

function recordOutboundClick(record: OutboundClickRecord): void {
  try {
    const existing = getOutboundClicks()
    const next = [record, ...existing].slice(0, MAX_RECORDS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable (private browsing, quota) — click tracking is best-effort only.
  }
}

export interface BuyAtStoreResult {
  opened: boolean
  warning: string | null
}

/**
 * BUY AT STORE (spec §19/§23): validates the URL, records a non-sensitive outbound-click event
 * locally, then opens the exact source listing in a new tab. Never builds an internal checkout —
 * the transaction flow ends here. `noopener,noreferrer` prevents the opened tab from controlling
 * this window (spec's own required attribute).
 */
export function buyAtStore(listing: VoucherListing): BuyAtStoreResult {
  if (!isValidUrl(listing.sourceUrl)) {
    return { opened: false, warning: 'This listing has no valid source link and cannot be opened.' }
  }

  recordOutboundClick({
    listingId: listing.id,
    brand: listing.brand,
    voucherName: listing.voucherName,
    sourceName: listing.sourceName,
    sourceUrl: listing.sourceUrl,
    routingQuality: listing.routingQuality,
    clickedAt: new Date().toISOString(),
  })

  window.open(listing.sourceUrl, '_blank', 'noopener,noreferrer')

  const warning = listing.routingQuality < 0.6 ? 'This link may require additional searching on the source website.' : null
  return { opened: true, warning }
}
