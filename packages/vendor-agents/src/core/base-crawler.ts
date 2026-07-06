import type { Browser } from "playwright";
import type { RawVendorOffer } from "@voucher-sor/shared-types";
import { logEvent } from "@voucher-sor/logger";

/**
 * Abstract base for the Vendor Discovery Engine's per-vendor crawlers. Unlike BaseVendorAgent,
 * crawlers don't carry the one-instance-per-order isolation requirement — browsing a public catalog
 * has none of the checkout-side-effect risk a purchase does — so a single instance may run many
 * crawl() calls over its lifetime.
 */
export abstract class BaseCrawler {
  constructor(
    protected readonly vendorId: string,
    protected readonly browser: Browser,
  ) {}

  /** Opens the vendor site, searches, and collects price/stock/delivery/payment/checkout data. */
  protected abstract searchProducts(query: string): Promise<RawVendorOffer[]>;

  async crawl(query: string): Promise<RawVendorOffer[]> {
    const startedAt = Date.now();
    const offers = await this.searchProducts(query);
    const durationMs = Date.now() - startedAt;
    logEvent("crawl", {
      vendorId: this.vendorId,
      message: `Crawled ${offers.length} offer(s) for query "${query}"`,
      metadata: { durationMs, query, count: offers.length },
    });
    return offers;
  }

  async dispose(): Promise<void> {
    // No shared per-crawl browser resources are held at this layer by default — subclasses that
    // open a persistent context/page across multiple crawl() calls should override this to close it.
  }
}
