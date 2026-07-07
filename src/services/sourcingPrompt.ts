import type { GlobalSourceResult, SourcingSearchParams } from '@/types'
import { currencyForCountry } from '@/data/countries'
import { convertCurrency } from '@/data/exchangeRates'

/**
 * Prompt for the Global Sourcing agent (spec: buy from anywhere in the world, resell into one of
 * the 7 target markets). Deliberately asks the model to report the vendor's OWN country/currency
 * as quoted — currency conversion into the target market happens deterministically afterwards via
 * the fixed exchange-rate table, not by the model, so it stays consistent and auditable.
 */
export function buildSourcingPrompt(params: SourcingSearchParams): string {
  const targetCurrency = currencyForCountry(params.targetCountry)

  return `You are the Global Sourcing Agent for a reseller who buys vouchers and gift cards from vendors ANYWHERE IN THE WORLD in order to resell them for use in ${params.targetCountry} (currency: ${targetCurrency}).

Task: use web search to find CURRENT, REAL vendors — official brand stores or reputable marketplaces, based in ANY country — that currently sell "${params.query}" gift cards or vouchers. Do not limit the search to vendors located in ${params.targetCountry}; the whole point is finding the cheapest real source anywhere globally.

For each result, report:
- the vendor's own operating country (sourceCountry) and the currency they quote in (sourceCurrency) — do NOT convert the price yourself, report it exactly as quoted
- the price as shown (price, a plain number in sourceCurrency)
- whether it's an official brand store or a marketplace/reseller (sellerType)
- a trustScore 0-100: official brand site 85-100, well-known international marketplace 60-84, lesser-known reseller 30-59, unverified 0-29

Return ONLY a JSON object (no prose, no markdown fence) of this exact shape:
{
  "results": [
    {
      "brand": "Steam",
      "category": "Gaming",
      "sourceCountry": "United States",
      "sourceCurrency": "USD",
      "price": 20,
      "availability": "in stock",
      "sellerType": "official",
      "url": "https://...",
      "sourceName": "site or host name",
      "trustScore": 90
    }
  ]
}
Return up to 10 results, sorted by nothing in particular (the app will rank them). Omit a field if genuinely unknown, but brand, sourceCountry, sourceCurrency, price, and url are required. Output the JSON object and nothing else.`
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function num(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
  return Number.isFinite(n) ? n : undefined
}

function clampScore(v: unknown): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
}

function coerceResult(r: Record<string, unknown>, targetCountry: string, index: number): GlobalSourceResult | null {
  const brand = str(r.brand)
  const sourceCountry = str(r.sourceCountry)
  const sourceCurrency = str(r.sourceCurrency)
  const price = num(r.price)
  const url = str(r.url)
  // Every field here must trace back to the model's reported evidence — never fabricate a missing
  // required field (e.g. defaulting price to 0), since that would misrepresent a real listing.
  if (!brand || !sourceCountry || !sourceCurrency || price === undefined || !url) return null

  const targetCurrency = currencyForCountry(targetCountry)
  return {
    id: `src-${targetCountry}-${index}-${url}`,
    brand,
    category: str(r.category),
    sourceCountry,
    sourceCurrency: sourceCurrency.toUpperCase(),
    price,
    convertedPrice: convertCurrency(price, sourceCurrency, targetCurrency),
    targetCurrency,
    availability: str(r.availability),
    sellerType: str(r.sellerType) === 'official' ? 'official' : 'marketplace',
    url,
    sourceName: str(r.sourceName),
    trustScore: clampScore(r.trustScore),
  }
}

/** Extracts the JSON object from the model's text response and coerces it into GlobalSourceResult[]. */
export function parseSourcingResults(text: string, targetCountry: string): GlobalSourceResult[] {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fence ? fence[1]! : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return []

  let raw: { results?: unknown[] }
  try {
    raw = JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return []
  }

  const results = Array.isArray(raw.results) ? raw.results : []
  return results
    .map((r, i) => coerceResult(r as Record<string, unknown>, targetCountry, i))
    .filter((r): r is GlobalSourceResult => r !== null)
}

/** Ranks by converted price ascending (cheapest source first) — ties broken by trust score descending. */
export function rankSourcingResults(results: GlobalSourceResult[]): GlobalSourceResult[] {
  return [...results].sort((a, b) => a.convertedPrice - b.convertedPrice || b.trustScore - a.trustScore)
}
