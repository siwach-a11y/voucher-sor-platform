import type { SearchIntent } from '@/types'
import { MOCK_LISTINGS } from '@/data/mockListings'
import { CATEGORIES } from '@/data/categories'

const KNOWN_BRANDS = Array.from(new Set(MOCK_LISTINGS.map((l) => l.brand)))

const VOUCHER_TYPE_KEYWORDS: Record<string, 'digital' | 'physical'> = {
  digital: 'digital',
  electronic: 'digital',
  'e-voucher': 'digital',
  evoucher: 'digital',
  'e-gift': 'digital',
  egift: 'digital',
  code: 'digital',
  physical: 'physical',
  card: 'physical',
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  starbucks: 'food_dining',
  cafe: 'food_dining',
  coffee: 'food_dining',
  dining: 'food_dining',
  restaurant: 'food_dining',
  playstation: 'game_topup',
  steam: 'game_topup',
  game: 'game_topup',
  'top-up': 'game_topup',
  topup: 'game_topup',
  cinema: 'entertainment',
  movie: 'entertainment',
  streaming: 'entertainment',
  hotel: 'travel',
  airline: 'travel',
  flight: 'travel',
  travel: 'travel',
  activity: 'travel',
  fashion: 'retail',
  electronics: 'retail',
  department: 'retail',
}

/**
 * Deterministic query parser (spec §5). Modular by design so an AI-assisted parser can
 * replace/supplement it later without changing the SearchOrchestrator's contract — see spec §27
 * ("AI responsibilities: query understanding" vs "Deterministic code: ... thresholds, sorting").
 */
export function parseSearchQuery(rawQuery: string): SearchIntent {
  const query = rawQuery.trim()
  const lower = query.toLowerCase()

  const intent: SearchIntent = { rawQuery: query, country: 'Thailand', currency: 'THB' }

  const brand = KNOWN_BRANDS.find((b) => lower.includes(b.toLowerCase()))
  if (brand) intent.brand = brand

  const faceValueMatch = lower.match(/(\d{2,6})\s*(baht|thb|฿)?/)
  if (faceValueMatch) {
    const value = Number(faceValueMatch[1])
    if (Number.isFinite(value) && value > 0) intent.faceValue = value
  }

  for (const [keyword, type] of Object.entries(VOUCHER_TYPE_KEYWORDS)) {
    if (lower.includes(keyword)) {
      intent.voucherType = type
      break
    }
  }

  for (const [keyword, categoryId] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      intent.category = categoryId
      break
    }
  }
  if (!intent.category) {
    const explicitCategory = CATEGORIES.find((c) => c.id !== 'all' && lower.includes(c.label.toLowerCase()))
    if (explicitCategory) intent.category = explicitCategory.id
  }

  return intent
}
