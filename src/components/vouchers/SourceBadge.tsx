import type { SellerType } from '@/types'
import { Badge } from '@/components/common/Badge'

const LABEL_BY_SELLER_TYPE: Record<SellerType, string> = {
  official: 'Official',
  marketplace: 'Marketplace',
  reseller: 'Reseller',
  unknown: 'Unknown seller',
}

export function SourceBadge({ sellerType }: { sellerType: SellerType }) {
  return <Badge tone={sellerType === 'official' ? 'accent' : 'neutral'}>{LABEL_BY_SELLER_TYPE[sellerType]}</Badge>
}
