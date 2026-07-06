import type { RankingMode, VoucherGroup, VoucherListing } from '@/types'
import { rankListings } from '@/engine/ranking'
import { VoucherResultCard } from '@/components/vouchers/VoucherResultCard'
import { formatMoney } from '@/utils/currency'

interface VoucherResultListProps {
  groups: VoucherGroup[]
  rankingMode: RankingMode
  selectedListingId: string | null
  onSelect: (listing: VoucherListing) => void
  onBuy: (listing: VoucherListing) => void
  onToggleWatch: (group: VoucherGroup) => void
  isWatched: (canonicalVoucherId: string) => boolean
}

export function VoucherResultList({ groups, rankingMode, selectedListingId, onSelect, onBuy, onToggleWatch, isWatched }: VoucherResultListProps) {
  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const ranked = rankListings(group.listings, rankingMode)
        const listingById = new Map(group.listings.map((l) => [l.id, l]))
        const cheapest = Math.min(...group.listings.map((l) => l.totalCost))

        return (
          <section key={group.canonicalVoucherId}>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-navy-900">
                {group.brand} — {group.voucherName}
              </h2>
              <p className="text-xs text-gray-500">
                From {formatMoney(cheapest, group.currency)} · {group.listings.length} verified listing{group.listings.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="space-y-3">
              {ranked.map((r) => {
                const listing = listingById.get(r.listingId)!
                return (
                  <VoucherResultCard
                    key={listing.id}
                    listing={listing}
                    rank={r.rank}
                    badge={r.badge}
                    isSelected={listing.id === selectedListingId}
                    onSelect={() => onSelect(listing)}
                    onBuy={() => onBuy(listing)}
                    onToggleWatch={() => onToggleWatch(group)}
                    isWatched={isWatched(group.canonicalVoucherId)}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
