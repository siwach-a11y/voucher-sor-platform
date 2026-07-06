import type { FastifyInstance } from "fastify";
import { prisma } from "@voucher-sor/db";
import { rankOffers } from "@voucher-sor/sor-engine";
import { loadScoringCandidates, toNumber } from "../lib/scoring-candidates.js";

export async function offersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { id: string } }>("/:id/offers", async (request, reply) => {
    const product = await prisma.product.findUnique({ where: { id: request.params.id } });
    if (!product) return reply.status(404).send({ error: "Product not found" });

    const { candidates, offers } = await loadScoringCandidates(request.params.id);
    const ranked = rankOffers(candidates);
    const offersById = new Map(offers.map((offer) => [offer.id, offer]));

    const comparison = ranked.map((score) => {
      const offer = offersById.get(score.offerId);
      return {
        ...score,
        vendorName: offer?.vendor.name ?? null,
        vendorWebsite: offer?.vendor.website ?? null,
        price: offer ? toNumber(offer.price) : null,
        currency: offer?.currency ?? null,
        estimatedDeliveryMinutes: offer?.estimatedDeliveryMinutes ?? null,
      };
    });

    return reply.send(comparison);
  });
}
