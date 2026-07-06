import type { RawListing, SearchIntent, SourceAdapter } from '@/types'
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

  const query = intent.rawQuery.trim().toLowerCase()
  if (!intent.brand && !intent.category) {
    // No structured signal extracted — fall back to plain substring search over brand/voucher name.
    const haystack = `${template.brand} ${template.voucherName}`.toLowerCase()
    if (query && !haystack.includes(query) && !query.split(/\s+/).some((word) => haystack.includes(word))) {
      return false
    }
  }
  return true
}

function toListingUrl(domain: string, canonicalVoucherId: string, sourceId: string): string {
  return `https://${domain}/listings/${canonicalVoucherId}-${sourceId}`
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
    return isValidUrl(url) && url.includes(this.domain)
  }

  private toRawListing(template: MockListingTemplate, now: number): RawListing {
    const source = getMockSource(this.id)
    return {
      sourceName: source.name,
      sourceDomain: source.domain,
      sourceSpeed: source.speed,
      listingTitle: template.voucherName,
      listingUrl: toListingUrl(source.domain, template.canonicalVoucherId, source.id),
      brand: template.brand,
      category: template.category,
      subcategory: template.subcategory,
      voucherType: template.voucherType,
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
