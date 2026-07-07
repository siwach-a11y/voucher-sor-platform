export interface Country {
  name: string
  currency: string
}

/** Demo markets — the 7 emerging markets this app targets. All listing data is fictional/invented. */
export const COUNTRIES: Country[] = [
  { name: 'Sri Lanka', currency: 'LKR' },
  { name: 'Indonesia', currency: 'IDR' },
  { name: 'Bangladesh', currency: 'BDT' },
  { name: 'Vietnam', currency: 'VND' },
  { name: 'Myanmar', currency: 'MMK' },
  { name: 'Ethiopia', currency: 'ETB' },
  { name: 'Nigeria', currency: 'NGN' },
]

export function currencyForCountry(country: string): string {
  return COUNTRIES.find((c) => c.name.toLowerCase() === country.trim().toLowerCase())?.currency ?? 'USD'
}
