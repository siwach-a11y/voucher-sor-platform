import type { RankedListing, VoucherListing } from '@/types'
import { formatMoney } from '@/utils/currency'
import { formatRelativeTime } from '@/utils/date'
import { AvailabilityBadge } from '@/components/vouchers/AvailabilityBadge'
import { ConfidenceBadge } from '@/components/vouchers/ConfidenceBadge'
import { SavingsBadge } from '@/components/vouchers/SavingsBadge'
import { classifyConfidence } from '@/engine/confidence'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { Star } from 'lucide-react'

const BADGE_LABEL: Record<NonNullable<RankedListing['badge']>, string> = {
  BEST_PRICE: 'Best Price',
  BEST_VALUE: 'Best Value',
  MOST_RELIABLE: 'Most Reliable',
}

interface VoucherResultCardProps {
  listing: VoucherListing
  rank: number
  badge: RankedListing['badge']
  isSelected: boolean
  onSelect: () => void
  onBuy: () => void
  onToggleWatch: () => void
  isWatched: boolean
}

export function VoucherResultCard({ listing, rank, badge, isSelected, onSelect, onBuy, onToggleWatch, isWatched }: VoucherResultCardProps) {
  const confidenceLabel = classifyConfidence(listing.evidenceConfidence)
  const isPurchasable = listing.availabilityStatus !== 'UNAVAILABLE'

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border bg-white p-4 transition-colors ${
        isSelected ? 'border-accent-500 ring-1 ring-accent-500' : 'border-gray-200 hover:border-navy-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-navy-700">
          {rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-navy-900">{listing.voucherName}</p>
            {badge && <Badge tone="accent">{BADGE_LABEL[badge]}</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {listing.voucherType === 'digital' ? 'Digital' : listing.voucherType === 'physical' ? 'Physical' : 'Format unknown'} ·{' '}
            {listing.sellerName} via {listing.sourceName}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AvailabilityBadge status={listing.availabilityStatus} />
            <ConfidenceBadge label={confidenceLabel} compact />
            <span className="text-[11px] text-gray-400">Checked {formatRelativeTime(listing.lastCheckedAt)}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-navy-900">{formatMoney(listing.totalCost, listing.currency)}</p>
          <p className="text-xs text-gray-400 line-through">{formatMoney(listing.faceValue, listing.currency)} face value</p>
          <div className="mt-1">
            <SavingsBadge amount={listing.discountAmount} percent={listing.discountPercent} currency={listing.currency} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <Button
          variant="ghost"
          size="sm"
          icon={<Star size={14} className={isWatched ? 'fill-accent-600 text-accent-600' : ''} />}
          onClick={(event) => {
            event.stopPropagation()
            onToggleWatch()
          }}
        >
          {isWatched ? 'Watching' : 'Save'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!isPurchasable}
          onClick={(event) => {
            event.stopPropagation()
            onBuy()
          }}
        >
          {isPurchasable ? 'Buy at Store' : 'Unavailable'}
        </Button>
      </div>
    </div>
  )
}
