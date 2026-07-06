import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'

function clearAllLocalData() {
  localStorage.removeItem('voucherhub:watchlist')
  localStorage.removeItem('voucherhub:priceAlerts')
  localStorage.removeItem('voucherhub:recentSearches')
  localStorage.removeItem('voucherhub:outboundClicks')
  window.location.reload()
}

export function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-1 text-xl font-semibold text-navy-900">Settings</h1>
      <p className="mb-6 text-sm text-gray-500">VoucherHub V1 — local-only preferences.</p>

      <Card className="max-w-lg p-4">
        <p className="text-sm font-semibold text-navy-900">About this data</p>
        <p className="mt-1 text-sm text-gray-500">
          Your watchlist, price alerts, and search history are stored only in this browser
          (localStorage) — VoucherHub has no account system and no server-side storage in V1.
        </p>
      </Card>

      <Card className="mt-4 max-w-lg p-4">
        <p className="text-sm font-semibold text-navy-900">Reset local data</p>
        <p className="mt-1 text-sm text-gray-500">Clears your watchlist, alerts, recent searches, and click history from this device.</p>
        <Button variant="danger" className="mt-3" onClick={clearAllLocalData}>
          Clear all local data
        </Button>
      </Card>
    </div>
  )
}
