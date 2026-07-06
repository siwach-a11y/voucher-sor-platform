import { useEffect, useState } from 'react'
import { useWatchlist } from '@/hooks/useWatchlist'
import { createAlert, getAlerts, removeAlert, type PriceAlert } from '@/services/priceAlertService'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { EmptyResults } from '@/components/vouchers/EmptyResults'
import { formatMoney } from '@/utils/currency'
import { formatRelativeTime } from '@/utils/date'
import { Trash2 } from 'lucide-react'

export function AlertsPage() {
  const { items: watchlist } = useWatchlist()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [selectedVoucherId, setSelectedVoucherId] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [minimumConfidence, setMinimumConfidence] = useState(0.8)
  const [onlyLiveListings, setOnlyLiveListings] = useState(true)

  useEffect(() => {
    setAlerts(getAlerts())
    if (watchlist.length > 0 && !selectedVoucherId) setSelectedVoucherId(watchlist[0]!.canonicalVoucherId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist])

  function handleCreate() {
    const voucher = watchlist.find((item) => item.canonicalVoucherId === selectedVoucherId)
    if (!voucher || !targetPrice) return
    createAlert({
      canonicalVoucherId: voucher.canonicalVoucherId,
      brand: voucher.brand,
      voucherName: voucher.voucherName,
      currency: voucher.currency,
      targetPrice: Number(targetPrice),
      minimumConfidence,
      onlyLiveListings,
    })
    setAlerts(getAlerts())
    setTargetPrice('')
  }

  function handleRemove(id: string) {
    removeAlert(id)
    setAlerts(getAlerts())
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold text-navy-900">Price Alerts</h1>
      <p className="mb-6 text-sm text-gray-500">Get notified when a watched voucher drops to your target price.</p>

      <Card className="mb-6 p-4">
        <p className="mb-3 text-sm font-semibold text-navy-900">Create an alert</p>
        {watchlist.length === 0 ? (
          <p className="text-sm text-gray-500">Save a voucher to your watchlist first — alerts are set on watched vouchers.</p>
        ) : (
          <div className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">
              Voucher
              <select
                value={selectedVoucherId}
                onChange={(event) => setSelectedVoucherId(event.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1.5"
              >
                {watchlist.map((item) => (
                  <option key={item.canonicalVoucherId} value={item.canonicalVoucherId}>
                    {item.brand} — {formatMoney(item.faceValue, item.currency)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Notify when total cost ≤
              <input
                type="number"
                value={targetPrice}
                onChange={(event) => setTargetPrice(event.target.value)}
                placeholder="e.g. 450"
                className="w-28 rounded-md border border-gray-300 px-2 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1">
              Minimum confidence
              <select
                value={minimumConfidence}
                onChange={(event) => setMinimumConfidence(Number(event.target.value))}
                className="rounded-md border border-gray-300 px-2 py-1.5"
              >
                <option value={0.9}>Very High</option>
                <option value={0.8}>High</option>
                <option value={0.65}>Medium</option>
                <option value={0}>Any</option>
              </select>
            </label>
            <label className="flex items-center gap-1.5 pb-1.5">
              <input type="checkbox" checked={onlyLiveListings} onChange={(event) => setOnlyLiveListings(event.target.checked)} />
              Only live listings
            </label>
            <Button onClick={handleCreate} disabled={!targetPrice}>
              Create Alert
            </Button>
          </div>
        )}
      </Card>

      {alerts.length === 0 ? (
        <EmptyResults title="No alerts yet" description="Create an alert above to get notified when a price target is reached." />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-navy-900">
                  {alert.brand} — {alert.voucherName}
                </p>
                <p className="text-xs text-gray-500">
                  Notify when total cost ≤ {formatMoney(alert.targetPrice, alert.currency)}
                  {alert.onlyLiveListings ? ' · live listings only' : ''}
                </p>
                {alert.triggered && (
                  <p className="mt-1 text-xs text-live">Triggered {formatRelativeTime(alert.triggeredAt!)}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={alert.triggered ? 'positive' : 'neutral'}>{alert.triggered ? 'Triggered' : 'Watching'}</Badge>
                <Button variant="ghost" size="sm" icon={<Trash2 size={14} />} onClick={() => handleRemove(alert.id)} aria-label="Remove alert" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
