const SYMBOLS: Record<string, string> = { THB: '฿', USD: '$', EUR: '€', GBP: '£' }

export function formatMoney(amount: number, currency: string): string {
  const symbol = SYMBOLS[currency]
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency}`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
