import type { Product } from '../product/product.js'

/** Request handed to a connector's search() — what to look for, not where to look. */
export interface SearchRequest {
  product: Product
  query?: string
}

/** One connector's reported offer for a product. Every field must trace back to something the
 * connector actually observed — the framework never fabricates a missing value. */
export interface SearchResult {
  connectorId: string
  externalId: string
  price: number
  currency: string
  inStock: boolean | 'unknown'
  checkoutAvailable: boolean
  estimatedDeliveryMinutes?: number | null
  paymentMethods?: string[]
  scrapedAt: string
  metadata?: Record<string, unknown>
}
