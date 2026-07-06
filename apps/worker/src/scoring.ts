import { prisma } from "@voucher-sor/db";
import { rankOffers } from "@voucher-sor/sor-engine";
import type { ScoringCandidate } from "@voucher-sor/sor-engine";
import type { CaptchaLevel } from "@voucher-sor/shared-types";
import { logger } from "@voucher-sor/logger";

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

/** Recomputes and persists Offer.finalScore for every product's offers. Ineligible offers (vendor
 * disabled / checkout unavailable) are set back to null since rankOffers never scored them. */
export async function recalculateAllScores(): Promise<void> {
  const products = await prisma.product.findMany({ select: { id: true } });

  for (const product of products) {
    const offers = await prisma.offer.findMany({
      where: { productId: product.id },
      include: { vendor: { include: { stats: true } } },
    });
    if (offers.length === 0) continue;

    const candidates: ScoringCandidate[] = offers.map((offer) => {
      const stats = offer.vendor.stats;
      return {
        vendorId: offer.vendorId,
        offerId: offer.id,
        price: toNumber(offer.price),
        stockStatus: offer.stockStatus,
        averageCheckoutTimeMs: offer.checkoutSpeedMs,
        successfulOrders: stats?.successfulOrders ?? 0,
        totalOrders: stats?.totalOrders ?? 0,
        successfulExecutions: stats?.successfulExecutions ?? 0,
        totalExecutions: stats?.totalExecutions ?? 0,
        lastCaptchaLevel: (stats?.lastCaptchaLevel ?? "none") as CaptchaLevel,
        eligible: offer.vendor.enabled && offer.checkoutAvailable,
      };
    });

    const ranked = rankOffers(candidates);
    const scoreByOfferId = new Map(ranked.map((score) => [score.offerId, score.finalScore]));

    await Promise.all(
      offers.map((offer) =>
        prisma.offer.update({
          where: { id: offer.id },
          data: { finalScore: scoreByOfferId.get(offer.id) ?? null },
        }),
      ),
    );
  }

  logger.info({ productCount: products.length }, "Recalculated offer scores");
}
