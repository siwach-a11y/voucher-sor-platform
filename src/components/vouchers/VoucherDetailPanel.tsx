import { useState, type ReactNode } from 'react'
import type { RankingMode, VoucherGroup, VoucherListing } from '@/types'
import { formatMoney, formatPercent } from '@/utils/currency'
import { formatRelativeTime } from '@/utils/date'
import { routingQualityLabel } from '@/utils/url'
import { rankListings } from '@/engine/ranking'
import { classifyConfidence } from '@/engine/confidence'
import { AvailabilityBadge } from '@/components/vouchers/AvailabilityBadge'
import { ConfidenceBadge } from '@/components/vouchers/ConfidenceBadge'
import { PriceComparisonTable } from '@/components/vouchers/PriceComparisonTable'
import { TierBadge } from '@/components/vouchers/TierBadge'
import { Button } from '@/components/common/Button'
import { ChevronDown, ExternalLink, Star } from 'lucide-react'

interface VoucherDetailPanelProps {
  listing: VoucherListing
  group: VoucherGroup
  rankingMode: RankingMode
  onBuy: (listing: VoucherListing) => void
  onToggleWatch: (group: VoucherGroup) => void
  isWatched: boolean
}

export function VoucherDetailPanel({ listing, group, rankingMode, onBuy, onToggleWatch, isWatched }: VoucherDetailPanelProps) {
  const [showWhy, setShowWhy] = useState(false)

  const ranked = rankListings(group.listings, rankingMode)
  const rankedSelf = ranked.find((r) => r.listingId === listing.id)
  const otherListings = group.listings.filter((l) => l.id !== listing.id)
  const isPurchasable = listing.availabilityStatus !== 'UNAVAILABLE'

  return (
    <div className="flex h-full flex-col p-5">
      <p className="text-xs text-gray-400">{listing.sourceName}</p>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-navy-900">{listing.voucherName}</h2>
        <TierBadge tier={listing.loyaltyTier} />
      </div>
      <p className="mt-0.5 text-xs text-gray-500">
        Sold by {listing.sellerName} ({listing.sellerType}) · {listing.country}
        {listing.loyaltyPoints != null && ` · ${listing.loyaltyPoints.toLocaleString()} loyalty points`}
      </p>

      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Price Summary</p>
        <p className="mt-1 text-2xl font-semibold text-navy-900">{formatMoney(listing.totalCost, listing.currency)}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            Face value
            <p className="font-medium text-navy-900">{formatMoney(listing.faceValue, listing.currency)}</p>
          </div>
          <div>
            You save
            <p className="font-medium text-live">
              {formatMoney(listing.discountAmount, listing.currency)} ({formatPercent(listing.discountPercent)})
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Voucher Details</p>
        <dl className="mt-2 space-y-1.5 text-sm">
          <Row label="Type" value={listing.voucherType} />
          <Row label="Validity" value={listing.validityDays ? `${listing.validityDays} days` : 'Not provided by source'} />
          <Row label="Redemption channel" value={listing.redemptionChannel ?? 'Not provided by source'} />
          <Row label="Geographic restriction" value={listing.geographicRestriction ?? 'Not provided by source'} />
        </dl>
        {listing.importantTerms.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-500">
            {listing.importantTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Verification</p>
        <dl className="mt-2 space-y-1.5 text-sm">
          <Row label="Availability" value={<AvailabilityBadge status={listing.availabilityStatus} />} />
          <Row label="Last checked" value={formatRelativeTime(listing.lastCheckedAt)} />
          <Row label="Evidence confidence" value={<ConfidenceBadge label={classifyConfidence(listing.evidenceConfidence)} compact />} />
          <Row label="Match confidence" value={`${Math.round(listing.matchConfidence * 100)}%`} />
          <Row label="Routing quality" value={routingQualityLabel(listing.routingQuality)} />
        </dl>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button variant="primary" disabled={!isPurchasable} icon={<ExternalLink size={15} />} onClick={() => onBuy(listing)}>
          {isPurchasable ? 'Buy at Store' : 'Currently Unavailable'}
        </Button>
        <Button
          variant="secondary"
          icon={<Star size={15} className={isWatched ? 'fill-accent-600 text-accent-600' : ''} />}
          onClick={() => onToggleWatch(group)}
        >
          {isWatched ? 'Watching this voucher' : 'Add to Watchlist'}
        </Button>
      </div>

      {rankedSelf && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => setShowWhy((prev) => !prev)}
            className="flex w-full items-center justify-between text-left text-sm font-medium text-navy-900"
          >
            Why this ranks here
            <ChevronDown size={16} className={`transition-transform ${showWhy ? 'rotate-180' : ''}`} />
          </button>
          {showWhy && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-600">
              {rankedSelf.breakdown.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {otherListings.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Other Verified Offers</p>
          <PriceComparisonTable listings={otherListings} />
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{value}</dd>
    </div>
  )
}
