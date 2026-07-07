import type { LoyaltyTier } from '@/types'

const TIER_CLASSES: Record<LoyaltyTier, string> = {
  Silver: 'bg-gray-100 text-gray-600',
  Gold: 'bg-amber-100 text-amber-700',
  Platinum: 'bg-accent-100 text-accent-700',
}

export function TierBadge({ tier }: { tier: LoyaltyTier }) {
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${TIER_CLASSES[tier]}`}>{tier}</span>
}
