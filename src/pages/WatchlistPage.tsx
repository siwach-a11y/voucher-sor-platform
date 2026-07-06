import { useNavigate } from 'react-router-dom'
import { useWatchlist } from '@/hooks/useWatchlist'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { EmptyResults } from '@/components/vouchers/EmptyResults'
import { formatMoney } from '@/utils/currency'
import { formatRelativeTime } from '@/utils/date'
import { Trash2 } from 'lucide-react'

export function WatchlistPage() {
  const { items, remove } = useWatchlist()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold text-navy-900">Watchlist</h1>
      <p className="mb-6 text-sm text-gray-500">Vouchers you're tracking for price changes.</p>

      {items.length === 0 ? (
        <EmptyResults title="Your watchlist is empty" description='Save a voucher from search results to track its best price over time.' />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Voucher</th>
                <th className="px-4 py-3 font-medium">Current Best Price</th>
                <th className="px-4 py-3 font-medium">Previous Best Price</th>
                <th className="px-4 py-3 font-medium">Price Change</th>
                <th className="px-4 py-3 font-medium">Best Source</th>
                <th className="px-4 py-3 font-medium">Live Offers</th>
                <th className="px-4 py-3 font-medium">Last Checked</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const change = item.previousBestPrice != null ? item.bestPrice - item.previousBestPrice : null
                return (
                  <tr key={item.canonicalVoucherId} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{item.brand}</p>
                      <p className="text-xs text-gray-400">{item.voucherName}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{formatMoney(item.bestPrice, item.currency)}</td>
                    <td className="px-4 py-3 text-gray-500">{item.previousBestPrice != null ? formatMoney(item.previousBestPrice, item.currency) : '—'}</td>
                    <td className={`px-4 py-3 font-medium ${change == null ? 'text-gray-400' : change < 0 ? 'text-live' : change > 0 ? 'text-unavailable' : 'text-gray-400'}`}>
                      {change == null ? '—' : `${change > 0 ? '+' : ''}${formatMoney(change, item.currency)}`}
                    </td>
                    <td className="px-4 py-3 text-navy-900">{item.bestSourceName}</td>
                    <td className="px-4 py-3 text-navy-900">{item.liveOfferCount}</td>
                    <td className="px-4 py-3 text-gray-400">{formatRelativeTime(item.lastCheckedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => navigate(`/search?q=${encodeURIComponent(`${item.brand} ${item.voucherName}`)}`)}>
                          View Offers
                        </Button>
                        <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => remove(item.canonicalVoucherId)} aria-label="Remove from watchlist" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
