import type { GlobalSourceResult } from '@/types'
import { formatMoney } from '@/utils/currency'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { ExternalLink } from 'lucide-react'

function trustTone(score: number): 'positive' | 'warning' | 'negative' {
  if (score >= 70) return 'positive'
  if (score >= 40) return 'warning'
  return 'negative'
}

export function GlobalSourceCard({ result, rank }: { result: GlobalSourceResult; rank: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-navy-700">
          {rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-navy-900">{result.brand}</p>
            {result.category && <span className="text-xs text-gray-400">{result.category}</span>}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {result.sourceName ?? new URL(result.url).hostname} · {result.sourceCountry} ({result.sourceCurrency})
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={result.sellerType === 'official' ? 'accent' : 'neutral'}>{result.sellerType}</Badge>
            <Badge tone={trustTone(result.trustScore)}>Trust {result.trustScore}</Badge>
            {result.availability && <span className="text-[11px] text-gray-400">{result.availability}</span>}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-navy-900">≈ {formatMoney(result.convertedPrice, result.targetCurrency)}</p>
          <p className="text-xs text-gray-400">{formatMoney(result.price, result.sourceCurrency)} at source</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        <a href={result.url} target="_blank" rel="noopener noreferrer">
          <Button variant="primary" size="sm" icon={<ExternalLink size={14} />}>
            Buy at Source
          </Button>
        </a>
      </div>
    </div>
  )
}
