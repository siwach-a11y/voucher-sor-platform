import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@voucher-sor/db";

const patchVendorSchema = z.object({
  enabled: z.boolean().optional(),
  priority: z.number().int().optional(),
});

export async function vendorsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/", async (_request, reply) => {
    const vendors = await prisma.vendor.findMany({ include: { stats: true }, orderBy: { priority: "asc" } });
    return reply.send(vendors);
  });

  fastify.patch<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const parsed = patchVendorSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

    const existing = await prisma.vendor.findUnique({ where: { id: request.params.id } });
    if (!existing) return reply.status(404).send({ error: "Vendor not found" });

    const vendor = await prisma.vendor.update({ where: { id: request.params.id }, data: parsed.data });
    return reply.send(vendor);
  });
}
