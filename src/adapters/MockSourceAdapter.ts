import type { RawListing, SearchIntent, SourceAdapter, VoucherType } from '@/types'
import type { MockAdapterBehavior } from '@/adapters/types'
import type { MockListingTemplate } from '@/data/mockListings'
import { MOCK_LISTINGS } from '@/data/mockListings'
import { getMockSource } from '@/data/mockSources'
import { isValidUrl } from '@/utils/url'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function matchesIntent(template: MockListingTemplate, intent: SearchIntent): boolean {
  if (intent.brand && template.brand.toLowerCase() !== intent.brand.toLowerCase()) return false
  if (intent.category && template.category !== intent.category) return false
  if (intent.voucherType && intent.voucherType !== 'unknown' && template.voucherType !== intent.voucherType) return false
  if (intent.country && template.country.toLowerCase() !== intent.country.toLowerCase()) return false

  const query = intent.rawQuery.trim().toLowerCase()
  if (!intent.brand && !intent.category && !intent.country) {
    // No structured signal extracted — fall back to plain substring search over brand/voucher name.
    const haystack = `${template.brand} ${template.voucherName}`.toLowerCase()
    if (query && !haystack.includes(query) && !query.split(/\s+/).some((word) => haystack.includes(word))) {
      return false
    }
  }
  return true
}

/**
 * The mock source names/domains (giftflow.market, dealcrate.co, ...) are display-only branding —
 * none of them are real, registered domains, so a "Buy at Store" link built from them would either
 * hit a DNS error or, worse, land on an unrelated site some third party happens to actually own.
 * Real vendor integrations don't exist yet in V1 (spec §6).
 *
 * The query deliberately drops the fictional source/vendor name (it only pollutes real search
 * results with a company that doesn't exist) and keeps brand + country instead — for a real brand
 * (Starbucks, PlayStation, Steam) this reliably surfaces that brand's actual page; for a fictional
 * brand it still surfaces real, live marketplaces for that voucher category in that market. Landing
 * on Google Shopping rather than a plain web search puts real, purchasable listings front and
 * center instead of an intermediate search-results/AI-overview page.
 */
function toListingUrl(brand: string, country: string, voucherType: VoucherType): string {
  const query = `${brand} gift voucher ${country} buy online ${voucherType === 'digital' ? 'digital' : ''}`.trim()
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`
}

/**
 * Mock implementation of SourceAdapter (spec §6/§28) backed by src/data/mockListings.ts. A real
 * adapter (official API, affiliate feed, search-API discovery, permitted page fetch, ...) would
 * implement the exact same interface — nothing in SearchOrchestrator/UI code is mock-aware.
 */
export class MockSourceAdapter implements SourceAdapter {
  readonly id: string
  readonly name: string
  readonly domain: string
  private readonly behavior: MockAdapterBehavior

  constructor(sourceId: string, behavior: MockAdapterBehavior) {
    const source = getMockSource(sourceId)
    this.id = source.id
    this.name = source.name
    this.domain = source.domain
    this.behavior = behavior
  }

  async search(intent: SearchIntent): Promise<RawListing[]> {
    const latency = this.behavior.minLatencyMs + Math.random() * (this.behavior.maxLatencyMs - this.behavior.minLatencyMs)
    await delay(latency)

    if (Math.random() < this.behavior.failureRate) {
      throw new Error(`${this.name} did not respond in time`)
    }

    const now = Date.now()
    return MOCK_LISTINGS.filter((template) => template.sourceId === this.id && matchesIntent(template, intent)).map((template) =>
      this.toRawListing(template, now),
    )
  }

  async validate(url: string): Promise<boolean> {
    await delay(20)
    // Mock listing URLs are a real Google Shopping search (see toListingUrl), not built from
    // this.domain, which is display-only branding, not a real registered domain.
    return isValidUrl(url)
  }

  private toRawListing(template: MockListingTemplate, now: number): RawListing {
    const source = getMockSource(this.id)
    return {
      sourceName: source.name,
      sourceDomain: source.domain,
      sourceSpeed: source.speed,
      listingTitle: template.voucherName,
      listingUrl: toListingUrl(template.brand, template.country, template.voucherType),
      brand: template.brand,
      category: template.category,
      subcategory: template.subcategory,
      voucherType: template.voucherType,
      country: template.country,
      loyaltyTier: template.loyaltyTier,
      loyaltyPoints: template.loyaltyPoints,
      faceValue: template.faceValue,
      currency: template.currency,
      sellingPrice: template.sellingPrice,
      mandatoryFee: template.mandatoryFee,
      shippingFee: template.shippingFee,
      expiryDate: template.expiryDate,
      validityDays: template.validityDays,
      redemptionChannel: template.redemptionChannel,
      geographicRestriction: template.geographicRestriction,
      importantTerms: template.importantTerms,
      sellerName: template.sellerName,
      sellerType: template.sellerType,
      availabilityText: template.availabilityText,
      observedAt: new Date(now - template.checkedMinutesAgo * 60_000).toISOString(),
      routingQuality: template.routingQuality,
      sourceReliability: source.reliability,
      mockCanonicalVoucherId: template.canonicalVoucherId,
    }
  }
}
