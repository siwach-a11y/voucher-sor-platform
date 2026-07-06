import type { FastifyInstance } from "fastify";
import { prisma } from "@voucher-sor/db";

export async function productsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Querystring: { query?: string; country?: string; category?: string } }>("/", async (request, reply) => {
    const { query, country, category } = request.query;

    const products = await prisma.product.findMany({
      where: {
        ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
        ...(country ? { country } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { name: "asc" },
    });

    return reply.send(products);
  });

  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const product = await prisma.product.findUnique({ where: { id: request.params.id } });
    if (!product) return reply.status(404).send({ error: "Product not found" });
    return reply.send(product);
  });
}
