export interface Country {
  name: string
  currency: string
}

/** Fictional demo markets — a distinct global spread to exercise multi-country search/matching. */
export const COUNTRIES: Country[] = [
  { name: 'Thailand', currency: 'THB' },
  { name: 'Philippines', currency: 'PHP' },
  { name: 'Malaysia', currency: 'MYR' },
  { name: 'Kenya', currency: 'KES' },
  { name: 'Mexico', currency: 'MXN' },
  { name: 'United Arab Emirates', currency: 'AED' },
  { name: 'Poland', currency: 'PLN' },
]

export function currencyForCountry(country: string): string {
  return COUNTRIES.find((c) => c.name.toLowerCase() === country.trim().toLowerCase())?.currency ?? 'USD'
}
