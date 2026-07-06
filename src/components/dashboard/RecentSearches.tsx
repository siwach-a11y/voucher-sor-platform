import { useNavigate } from 'react-router-dom'
import type { RecentSearchRecord } from '@/services/historyService'
import { Card } from '@/components/common/Card'
import { formatRelativeTime } from '@/utils/date'
import { Clock } from 'lucide-react'

export function RecentSearches({ records }: { records: RecentSearchRecord[] }) {
  const navigate = useNavigate()

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold text-navy-900">Recent Searches</p>
      {records.length === 0 ? (
        <p className="text-sm text-gray-400">No searches yet.</p>
      ) : (
        <ul className="space-y-2">
          {records.slice(0, 6).map((record) => (
            <li key={record.query}>
              <button
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(record.query)}`)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50"
              >
                <span className="flex items-center gap-2 text-navy-900">
                  <Clock size={13} className="text-gray-400" />
                  {record.query}
                </span>
                <span className="text-xs text-gray-400">{record.resultsFound} results · {formatRelativeTime(record.searchedAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
