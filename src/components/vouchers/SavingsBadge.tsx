import { formatMoney, formatPercent } from '@/utils/currency'
import { Badge } from '@/components/common/Badge'

export function SavingsBadge({ amount, percent, currency }: { amount: number; percent: number; currency: string }) {
  if (amount <= 0) return <Badge tone="neutral">No discount</Badge>
  return (
    <Badge tone="positive">
      Save {formatMoney(amount, currency)} ({formatPercent(percent)})
    </Badge>
  )
}
