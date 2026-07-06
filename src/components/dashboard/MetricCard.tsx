import type { ReactNode } from 'react'
import { Card } from '@/components/common/Card'

export function MetricCard({ label, value, icon, tone = 'default' }: { label: string; value: ReactNode; icon: ReactNode; tone?: 'default' | 'positive' }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tone === 'positive' ? 'bg-live-bg text-live' : 'bg-accent-100 text-accent-700'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-navy-900">{value}</p>
      </div>
    </Card>
  )
}
