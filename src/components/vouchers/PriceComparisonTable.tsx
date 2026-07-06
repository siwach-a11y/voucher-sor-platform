import type { VoucherListing } from '@/types'
import { formatMoney } from '@/utils/currency'
import { AvailabilityBadge } from '@/components/vouchers/AvailabilityBadge'
import { formatRelativeTime } from '@/utils/date'

interface PriceComparisonTableProps {
  listings: VoucherListing[]
  highlightListingId?: string
}

/** Compact side-by-side comparison — used in the detail panel to show every other verified offer for the same voucher. */
export function PriceComparisonTable({ listings, highlightListingId }: PriceComparisonTableProps) {
  const sorted = [...listings].sort((a, b) => a.totalCost - b.totalCost)

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-gray-400">
          <th className="pb-1.5 font-medium">Source</th>
          <th className="pb-1.5 font-medium">Total Cost</th>
          <th className="pb-1.5 font-medium">Status</th>
          <th className="pb-1.5 font-medium">Checked</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((listing) => (
          <tr key={listing.id} className={listing.id === highlightListingId ? 'bg-accent-50' : undefined}>
            <td className="py-1.5 pr-2 text-navy-900">{listing.sourceName}</td>
            <td className="py-1.5 pr-2 font-medium text-navy-900">{formatMoney(listing.totalCost, listing.currency)}</td>
            <td className="py-1.5 pr-2">
              <AvailabilityBadge status={listing.availabilityStatus} />
            </td>
            <td className="py-1.5 text-gray-400">{formatRelativeTime(listing.lastCheckedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
