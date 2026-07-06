export interface Category {
  id: string
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'food_dining', label: 'Food & Dining' },
  { id: 'retail', label: 'Retail' },
  { id: 'travel', label: 'Travel' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'game_topup', label: 'Game Top-Up' },
  { id: 'services', label: 'Services' },
  { id: 'others', label: 'Others' },
]

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
