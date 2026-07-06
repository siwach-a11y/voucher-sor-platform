import type { ConfidenceLabel } from '@/types'
import { Badge, type BadgeTone } from '@/components/common/Badge'

const TONE_BY_LABEL: Record<ConfidenceLabel, BadgeTone> = {
  VERY_HIGH: 'positive',
  HIGH: 'positive',
  MEDIUM: 'warning',
  LOW: 'negative',
}

const TEXT_BY_LABEL: Record<ConfidenceLabel, string> = {
  VERY_HIGH: 'Very high confidence',
  HIGH: 'High confidence',
  MEDIUM: 'Medium confidence',
  LOW: 'Low confidence',
}

export function ConfidenceBadge({ label, compact = false }: { label: ConfidenceLabel; compact?: boolean }) {
  return <Badge tone={TONE_BY_LABEL[label]}>{compact ? label.replace('_', ' ') : TEXT_BY_LABEL[label]}</Badge>
}
