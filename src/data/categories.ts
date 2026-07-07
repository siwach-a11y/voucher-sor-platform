export interface Category {
  id: string
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'electronics', label: 'Electronics & Appliances' },
  { id: 'fashion', label: 'Fashion & Accessories' },
  { id: 'grocery', label: 'Grocery & Essentials' },
  { id: 'dining', label: 'Dining & Café' },
  { id: 'cinema_entertainment', label: 'Cinema & Entertainment' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'travel', label: 'Travel & Adventure' },
  { id: 'beauty_wellness', label: 'Beauty & Wellness' },
  { id: 'home_furniture', label: 'Home & Furniture' },
  { id: 'digital_subscriptions', label: 'Digital & Subscriptions' },
  { id: 'others', label: 'Others' },
]

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}
