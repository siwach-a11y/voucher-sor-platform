import { useNavigate } from 'react-router-dom'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { EmptyResults } from '@/components/vouchers/EmptyResults'
import { formatRelativeTime } from '@/utils/date'

export function HistoryPage() {
  const { records, clear } = useRecentSearches()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold text-navy-900">Search History</h1>
          <p className="text-sm text-gray-500">Everything you've searched for on this device.</p>
        </div>
        {records.length > 0 && (
          <Button variant="secondary" size="sm" onClick={clear}>
            Clear History
          </Button>
        )}
      </div>

      {records.length === 0 ? (
        <EmptyResults title="No search history yet" description="Searches you run will show up here." />
      ) : (
        <Card>
          <ul className="divide-y divide-gray-100">
            {records.map((record) => (
              <li key={record.query} className="flex items-center justify-between px-4 py-3">
                <button type="button" onClick={() => navigate(`/search?q=${encodeURIComponent(record.query)}`)} className="text-sm font-medium text-navy-900 hover:underline">
                  {record.query}
                </button>
                <span className="text-xs text-gray-400">
                  {record.resultsFound} results · {formatRelativeTime(record.searchedAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
