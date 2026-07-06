import type { WatchlistItem } from '@/services/watchlistService'
import { Card } from '@/components/common/Card'
import { formatMoney } from '@/utils/currency'
import { TrendingDown } from 'lucide-react'

/** Highlights watched vouchers whose best price has dropped since it was last checked — "Price Drops" on the dashboard. */
export function PriceMovementList({ items }: { items: WatchlistItem[] }) {
  const drops = items
    .filter((item) => item.previousBestPrice != null && item.bestPrice < item.previousBestPrice)
    .sort((a, b) => a.previousBestPrice! - a.bestPrice - (b.previousBestPrice! - b.bestPrice))
    .reverse()

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold text-navy-900">Recent Price Drops</p>
      {drops.length === 0 ? (
        <p className="text-sm text-gray-400">No price drops detected yet on your watched vouchers.</p>
      ) : (
        <ul className="space-y-2">
          {drops.map((item) => (
            <li key={item.canonicalVoucherId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-navy-900">
                <TrendingDown size={14} className="text-live" />
                {item.brand} — {formatMoney(item.faceValue, item.currency)}
              </span>
              <span className="text-live font-medium">
                {formatMoney(item.previousBestPrice!, item.currency)} → {formatMoney(item.bestPrice, item.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
