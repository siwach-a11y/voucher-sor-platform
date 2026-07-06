import { useEffect, useState } from 'react'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { getAlerts, type PriceAlert } from '@/services/priceAlertService'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RecentSearches } from '@/components/dashboard/RecentSearches'
import { WatchedVouchers } from '@/components/dashboard/WatchedVouchers'
import { PriceMovementList } from '@/components/dashboard/PriceMovementList'
import { Bell, Star, TrendingDown, Zap } from 'lucide-react'

export function DashboardPage() {
  const { items } = useWatchlist()
  const { records } = useRecentSearches()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])

  useEffect(() => {
    setAlerts(getAlerts())
  }, [])

  const liveOfferCount = items.reduce((sum, item) => sum + item.liveOfferCount, 0)
  const priceDropCount = items.filter((item) => item.previousBestPrice != null && item.bestPrice < item.previousBestPrice).length
  const activeAlertCount = alerts.filter((alert) => !alert.triggered).length

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold text-navy-900">Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Your voucher discovery and price-tracking overview.</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Watchlist Items" value={items.length} icon={<Star size={18} />} />
        <MetricCard label="Live Offers" value={liveOfferCount} icon={<Zap size={18} />} tone="positive" />
        <MetricCard label="Price Drops" value={priceDropCount} icon={<TrendingDown size={18} />} tone="positive" />
        <MetricCard label="Active Alerts" value={activeAlertCount} icon={<Bell size={18} />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentSearches records={records} />
        <WatchedVouchers items={items} />
        <PriceMovementList items={items} />
      </div>
    </div>
  )
}
