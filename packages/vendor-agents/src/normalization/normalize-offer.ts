import type { Offer, RawVendorOffer, StockStatus } from "@voucher-sor/shared-types";
import { STOCK_CONFIDENCE_MAP } from "@voucher-sor/sor-engine";

/** Offers scraped within this window still count as "confirmed"; older ones decay to "recently_scraped". */
const RECENCY_WINDOW_MS = 15 * 60 * 1000;

function toStockStatus(raw: RawVendorOffer): StockStatus {
  if (raw.inStock === "unknown") {
    return "unknown";
  }
  if (raw.inStock === false) {
    return "out_of_stock";
  }
  const ageMs = Date.now() - new Date(raw.scrapedAt).getTime();
  return ageMs <= RECENCY_WINDOW_MS ? "confirmed" : "recently_scraped";
}

export function normalizeOffer(
  raw: RawVendorOffer,
  priorSuccessRate: number,
  priorRiskScore: number,
): Omit<Offer, "id" | "finalScore"> {
  const stockStatus = toStockStatus(raw);

  return {
    vendorId: raw.vendorId,
    productId: raw.productExternalId,
    price: raw.price,
    currency: raw.currency,
    stockStatus,
    stockConfidence: STOCK_CONFIDENCE_MAP[stockStatus],
    // Checkout speed is measured empirically from real purchase attempts (BaseVendorAgent runs), not
    // observable by a crawler that never checks out — left at 0 here and filled in elsewhere.
    checkoutSpeedMs: 0,
    riskScore: priorRiskScore,
    successRate: priorSuccessRate,
    paymentMethods: raw.paymentMethods,
    checkoutAvailable: raw.checkoutAvailable,
    estimatedDeliveryMinutes: raw.estimatedDeliveryMinutes,
    lastUpdated: raw.scrapedAt,
  };
}
