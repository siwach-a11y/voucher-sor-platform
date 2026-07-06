import type { AvailabilityStatus } from '@/types'
import { Badge, type BadgeTone } from '@/components/common/Badge'

const TONE_BY_STATUS: Record<AvailabilityStatus, BadgeTone> = {
  LIVE: 'positive',
  STALE: 'warning',
  UNAVAILABLE: 'negative',
  UNKNOWN: 'neutral',
}

const LABEL_BY_STATUS: Record<AvailabilityStatus, string> = {
  LIVE: 'Live',
  STALE: 'Stale',
  UNAVAILABLE: 'Unavailable',
  UNKNOWN: 'Unknown',
}

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</Badge>
}
