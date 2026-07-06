import { prisma } from "@voucher-sor/db";
import type { CaptchaLevel } from "@voucher-sor/shared-types";
import type { ScoringCandidate } from "@voucher-sor/sor-engine";

/** Prisma Decimal -> number. decimal.js overrides toString(), so Number() parses it exactly. */
export function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

export interface OfferWithVendor {
  id: string;
  vendorId: string;
  productId: string;
  price: unknown;
  currency: string;
  stockStatus: string;
  checkoutSpeedMs: number;
  checkoutAvailable: boolean;
  estimatedDeliveryMinutes: number | null;
  finalScore: number | null;
  vendor: {
    id: string;
    name: string;
    website: string;
    enabled: boolean;
    stats: {
      successfulOrders: number;
      totalOrders: number;
      successfulExecutions: number;
      totalExecutions: number;
      lastCaptchaLevel: string;
    } | null;
  };
}

/**
 * Loads every Offer+Vendor+VendorStats row for a product and assembles the ScoringCandidate[]
 * the SOR engine needs, alongside the raw offer rows (joined with vendor name/website) so callers
 * can enrich a ScoreBreakdown response without re-querying.
 */
export async function loadScoringCandidates(
  productId: string,
): Promise<{ candidates: ScoringCandidate[]; offers: OfferWithVendor[] }> {
  const offers = (await prisma.offer.findMany({
    where: { productId },
    include: { vendor: { include: { stats: true } } },
  })) as unknown as OfferWithVendor[];

  const candidates: ScoringCandidate[] = offers.map((offer) => {
    const stats = offer.vendor.stats;
    const eligible = offer.vendor.enabled && offer.checkoutAvailable;
    return {
      vendorId: offer.vendorId,
      offerId: offer.id,
      price: toNumber(offer.price),
      stockStatus: offer.stockStatus as ScoringCandidate["stockStatus"],
      averageCheckoutTimeMs: offer.checkoutSpeedMs,
      successfulOrders: stats?.successfulOrders ?? 0,
      totalOrders: stats?.totalOrders ?? 0,
      successfulExecutions: stats?.successfulExecutions ?? 0,
      totalExecutions: stats?.totalExecutions ?? 0,
      lastCaptchaLevel: (stats?.lastCaptchaLevel ?? "none") as CaptchaLevel,
      eligible,
      ineligibleReason: eligible
        ? undefined
        : !offer.vendor.enabled
          ? "vendor disabled"
          : "checkout unavailable",
    };
  });

  return { candidates, offers };
}
