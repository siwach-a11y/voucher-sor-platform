import type { ReactNode } from 'react'

export type BadgeTone = 'neutral' | 'positive' | 'warning' | 'negative' | 'accent'

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-unknown-bg text-unknown',
  positive: 'bg-live-bg text-live',
  warning: 'bg-stale-bg text-stale',
  negative: 'bg-unavailable-bg text-unavailable',
  accent: 'bg-accent-100 text-accent-700',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  )
}
