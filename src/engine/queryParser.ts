import type { SearchIntent } from '@/types'
import { MOCK_LISTINGS } from '@/data/mockListings'
import { CATEGORIES } from '@/data/categories'
import { COUNTRIES } from '@/data/countries'

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
  starbucks: 'dining',
  cafe: 'dining',
  coffee: 'dining',
  dining: 'dining',
  restaurant: 'dining',
  grocery: 'grocery',
  supermarket: 'grocery',
  playstation: 'gaming',
  steam: 'gaming',
  game: 'gaming',
  gaming: 'gaming',
  'top-up': 'gaming',
  topup: 'gaming',
  cinema: 'cinema_entertainment',
  movie: 'cinema_entertainment',
  streaming: 'digital_subscriptions',
  subscription: 'digital_subscriptions',
  hotel: 'travel',
  airline: 'travel',
  flight: 'travel',
  travel: 'travel',
  activity: 'travel',
  adventure: 'travel',
  fashion: 'fashion',
  jewelry: 'fashion',
  watch: 'fashion',
  electronics: 'electronics',
  gadget: 'electronics',
  department: 'electronics',
  spa: 'beauty_wellness',
  beauty: 'beauty_wellness',
  wellness: 'beauty_wellness',
  furniture: 'home_furniture',
  home: 'home_furniture',
}

/** Currency code -> the country it maps to, so a query like "500 PHP" can infer a market even without naming the country. */
const CURRENCY_TO_COUNTRY: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.currency.toLowerCase(), c.name]))

/**
 * Deterministic query parser (spec §5). Modular by design so an AI-assisted parser can
 * replace/supplement it later without changing the SearchOrchestrator's contract — see spec §27
 * ("AI responsibilities: query understanding" vs "Deterministic code: ... thresholds, sorting").
 *
 * No default country/currency is assumed — the demo spans 7 distinct markets, so leaving these
 * undefined when a query doesn't name one is more honest than silently picking a market.
 */
export function parseSearchQuery(rawQuery: string): SearchIntent {
  const query = rawQuery.trim()
  const lower = query.toLowerCase()

  const intent: SearchIntent = { rawQuery: query }

  const country = COUNTRIES.find((c) => lower.includes(c.name.toLowerCase()))
  if (country) {
    intent.country = country.name
    intent.currency = country.currency
  } else {
    for (const [code, countryName] of Object.entries(CURRENCY_TO_COUNTRY)) {
      if (new RegExp(`\\b${code}\\b`).test(lower)) {
        intent.country = countryName
        intent.currency = code.toUpperCase()
        break
      }
    }
  }

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
