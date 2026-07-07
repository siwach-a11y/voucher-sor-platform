/** Data models for the Global Sourcing AI agent — finds real vendors anywhere in the world so
 * a reseller can buy a voucher/gift card from wherever it's cheapest and resell it into one of
 * VoucherHub's 7 target markets. Deliberately separate from VoucherListing/VoucherGroup: those
 * model a voucher's own redemption market, this models a global vendor's own operating region. */

export type SourcingSellerType = 'official' | 'marketplace'

export interface GlobalSourceResult {
  id: string
  brand: string
  category?: string
  /** Where the vendor itself operates from — may be entirely unrelated to the target resale market. */
  sourceCountry: string
  sourceCurrency: string
  /** Price as quoted by the vendor, in sourceCurrency. */
  price: number
  /** price converted into the target market's currency via the fixed demo FX table (utils/exchangeRates). */
  convertedPrice: number
  targetCurrency: string
  availability?: string
  sellerType: SourcingSellerType
  url: string
  sourceName?: string
  /** 0-100, assigned by the AI agent based on how official/reputable the vendor looks. */
  trustScore: number
}

export interface SourcingSearchParams {
  /** Free-text brand or voucher type, e.g. "Steam Wallet" or "Amazon gift card". */
  query: string
  /** One of the 7 target resale markets (country name, matching data/countries.ts). */
  targetCountry: string
}
