import { useNavigate } from 'react-router-dom'
import type { WatchlistItem } from '@/services/watchlistService'
import { Card } from '@/components/common/Card'
import { formatMoney } from '@/utils/currency'
import { formatRelativeTime } from '@/utils/date'

export function WatchedVouchers({ items }: { items: WatchlistItem[] }) {
  const navigate = useNavigate()

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-900">Watched Voucher Prices</p>
        <button type="button" onClick={() => navigate('/watchlist')} className="text-xs text-accent-600 hover:underline">
          View all
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing watched yet — save a voucher from search results.</p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 5).map((item) => {
            const priceDropped = item.previousBestPrice != null && item.bestPrice < item.previousBestPrice
            return (
              <li key={item.canonicalVoucherId} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-navy-900">
                    {item.brand} — {formatMoney(item.faceValue, item.currency)}
                  </p>
                  <p className="text-xs text-gray-400">Checked {formatRelativeTime(item.lastCheckedAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${priceDropped ? 'text-live' : 'text-navy-900'}`}>{formatMoney(item.bestPrice, item.currency)}</p>
                  {priceDropped && <p className="text-xs text-live">down from {formatMoney(item.previousBestPrice!, item.currency)}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
