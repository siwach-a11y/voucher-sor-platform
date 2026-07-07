/**
 * Fixed, illustrative demo exchange rates — NOT live rates. VoucherHub has no backend and doesn't
 * call a live FX API, so these are static approximate values (units of currency per 1 USD) used
 * only to give a rough side-by-side comparison across currencies. Never present these as current
 * market rates in the UI copy.
 */
export const RATES_PER_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  SGD: 1.35,
  AED: 3.67,
  INR: 83,
  CNY: 7.2,
  JPY: 150,
  AUD: 1.52,
  CAD: 1.36,
  HKD: 7.82,
  // The 7 target resale markets
  LKR: 300,
  IDR: 15800,
  BDT: 110,
  VND: 25400,
  MMK: 2100,
  ETB: 123,
  NGN: 1600,
}

/** Converts an amount between any two currencies in the table, via USD. Falls back to a 1:1 rate (with a console warning) for an unlisted currency, rather than throwing. */
export function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = RATES_PER_USD[from.toUpperCase()]
  const toRate = RATES_PER_USD[to.toUpperCase()]
  if (!fromRate || !toRate) {
    console.warn(`convertCurrency: unknown currency "${!fromRate ? from : to}", using 1:1 rate`)
    return amount
  }
  const usd = amount / fromRate
  return usd * toRate
}
