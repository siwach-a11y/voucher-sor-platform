import type { VoucherGroup } from '@/types'

export interface PriceAlert {
  id: string
  canonicalVoucherId: string
  brand: string
  voucherName: string
  currency: string
  targetPrice: number
  minimumConfidence: number
  onlyLiveListings: boolean
  createdAt: string
  triggered: boolean
  triggeredAt: string | null
  triggeredListingId: string | null
}

const STORAGE_KEY = 'voucherhub:priceAlerts'
/** MatchThreshold in the TriggerAlert formula (spec §24) — fixed at COMPARABLE_MATCH, matching the matcher's own bands. */
const MATCH_THRESHOLD = 0.75

function readAll(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PriceAlert[]) : []
  } catch {
    return []
  }
}

function writeAll(alerts: PriceAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  } catch {
    // best-effort only
  }
}

export function getAlerts(): PriceAlert[] {
  return readAll()
}

export function createAlert(input: {
  canonicalVoucherId: string
  brand: string
  voucherName: string
  currency: string
  targetPrice: number
  minimumConfidence: number
  onlyLiveListings: boolean
}): PriceAlert {
  const alert: PriceAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    createdAt: new Date().toISOString(),
    triggered: false,
    triggeredAt: null,
    triggeredListingId: null,
  }
  writeAll([alert, ...readAll()])
  return alert
}

export function removeAlert(id: string): void {
  writeAll(readAll().filter((a) => a.id !== id))
}

/**
 * TriggerAlert (spec §24): LiveListing AND MatchScore >= MatchThreshold AND TotalCost <=
 * UserTargetPrice AND EvidenceConfidence >= MinimumConfidence. Re-evaluated against fresh search
 * results; once triggered an alert stays triggered (pointing at the qualifying listing) until removed.
 */
export function evaluateAlerts(groups: VoucherGroup[]): PriceAlert[] {
  const alerts = readAll()
  const groupById = new Map(groups.map((g) => [g.canonicalVoucherId, g]))

  const updated = alerts.map((alert) => {
    if (alert.triggered) return alert
    const group = groupById.get(alert.canonicalVoucherId)
    if (!group) return alert

    const qualifying = group.listings.find(
      (listing) =>
        (!alert.onlyLiveListings || listing.availabilityStatus === 'LIVE') &&
        listing.matchConfidence >= MATCH_THRESHOLD &&
        listing.totalCost <= alert.targetPrice &&
        listing.evidenceConfidence >= alert.minimumConfidence,
    )

    if (!qualifying) return alert
    return { ...alert, triggered: true, triggeredAt: new Date().toISOString(), triggeredListingId: qualifying.id }
  })

  writeAll(updated)
  return updated
}
