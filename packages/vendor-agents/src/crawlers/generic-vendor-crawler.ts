import type { Browser } from "playwright";
import type { RawVendorOffer } from "@voucher-sor/shared-types";
import { BaseCrawler } from "../core/base-crawler.js";

/**
 * Configurable CSS selectors for one vendor's public search-results page. Wiring up a new vendor
 * with a GenericVendorCrawler + this config is the fast path for onboarding — see the package README.
 */
export interface VendorCrawlerSelectorConfig {
  /** e.g. "https://example-vendor.test/search?q={query}" */
  searchUrlTemplate: string;
  resultCardSelector: string;
  productExternalIdAttribute: string;
  productNameSelector: string;
  priceSelector: string;
  currency: string;
  stockSelector?: string;
  inStockText?: string;
  deliveryMinutesSelector?: string;
  paymentMethods: string[];
  checkoutAvailableSelector?: string;
}

/**
 * Example only: selectors referenced below are illustrative placeholders, not verified against any
 * real vendor site. Wire real selectors into VendorCrawlerSelectorConfig when onboarding an actual
 * supplier — this class is meant to be reused/configured, not subclassed, for the common case.
 */
export class GenericVendorCrawler extends BaseCrawler {
  constructor(
    vendorId: string,
    browser: Browser,
    private readonly selectors: VendorCrawlerSelectorConfig,
  ) {
    super(vendorId, browser);
  }

  protected async searchProducts(query: string): Promise<RawVendorOffer[]> {
    const context = await this.browser.newContext();
    const page = await context.newPage();
    try {
      const url = this.selectors.searchUrlTemplate.replace("{query}", encodeURIComponent(query));
      await page.goto(url);

      const cards = page.locator(this.selectors.resultCardSelector);
      const count = await cards.count();
      const scrapedAt = new Date().toISOString();
      const offers: RawVendorOffer[] = [];

      for (let i = 0; i < count; i += 1) {
        const card = cards.nth(i);
        const productExternalId =
          (await card.getAttribute(this.selectors.productExternalIdAttribute)) ?? `unknown-${i}`;
        const productName = (await card.locator(this.selectors.productNameSelector).textContent()) ?? "";
        const priceText = (await card.locator(this.selectors.priceSelector).textContent()) ?? "0";
        const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;

        let inStock: boolean | "unknown" = "unknown";
        if (this.selectors.stockSelector) {
          const stockText = await card.locator(this.selectors.stockSelector).textContent();
          if (stockText && this.selectors.inStockText) {
            inStock = stockText.includes(this.selectors.inStockText);
          }
        }

        let estimatedDeliveryMinutes: number | null = null;
        if (this.selectors.deliveryMinutesSelector) {
          const deliveryText = await card.locator(this.selectors.deliveryMinutesSelector).textContent();
          const parsed = deliveryText ? Number(deliveryText.replace(/[^0-9]/g, "")) : NaN;
          estimatedDeliveryMinutes = Number.isFinite(parsed) ? parsed : null;
        }

        let checkoutAvailable = true;
        if (this.selectors.checkoutAvailableSelector) {
          checkoutAvailable = (await card.locator(this.selectors.checkoutAvailableSelector).count()) > 0;
        }

        offers.push({
          vendorId: this.vendorId,
          productExternalId,
          productName: productName.trim(),
          price,
          currency: this.selectors.currency,
          inStock,
          estimatedDeliveryMinutes,
          paymentMethods: this.selectors.paymentMethods,
          checkoutAvailable,
          scrapedAt,
        });
      }

      return offers;
    } finally {
      await context.close();
    }
  }
}
