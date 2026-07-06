import type { Job } from "bullmq";
import { prisma } from "@voucher-sor/db";
import { logEvent } from "@voucher-sor/logger";
import type { RawVendorOffer } from "@voucher-sor/shared-types";
import { crawlQueue } from "./queues.js";

const CRAWL_INTERVAL_MINUTES = Number(process.env.CRAWL_INTERVAL_MINUTES ?? 10);

// TODO(vendor-agents): replace with a real Playwright crawl per vendor once vendor-agents ships
// crawler modules. For now this just logs so the repeatable-job/upsert plumbing can be exercised.
async function crawlVendor(vendorId: string): Promise<RawVendorOffer[]> {
  logEvent("crawl", { vendorId, message: "crawlVendor stub invoked — no-op until real crawlers exist" });
  return [];
}

function normalizeOffer(raw: RawVendorOffer): {
  vendorId: string;
  price: number;
  currency: string;
  stockStatus: "confirmed" | "unknown" | "out_of_stock";
  checkoutAvailable: boolean;
  paymentMethods: string[];
  estimatedDeliveryMinutes: number | null;
} {
  return {
    vendorId: raw.vendorId,
    price: raw.price,
    currency: raw.currency,
    stockStatus: raw.inStock === true ? "confirmed" : raw.inStock === false ? "out_of_stock" : "unknown",
    checkoutAvailable: raw.checkoutAvailable,
    paymentMethods: raw.paymentMethods,
    estimatedDeliveryMinutes: raw.estimatedDeliveryMinutes,
  };
}

export async function processCrawlJob(job: Job<{ vendorId: string }>): Promise<void> {
  const { vendorId } = job.data;
  const rawOffers = await crawlVendor(vendorId);

  for (const raw of rawOffers) {
    const normalized = normalizeOffer(raw);
    const product = await prisma.product.findFirst({ where: { name: raw.productName } });
    if (!product) continue;

    await prisma.offer.upsert({
      where: { vendorId_productId: { vendorId: normalized.vendorId, productId: product.id } },
      update: {
        price: normalized.price,
        currency: normalized.currency,
        stockStatus: normalized.stockStatus,
        checkoutAvailable: normalized.checkoutAvailable,
        paymentMethods: normalized.paymentMethods,
        estimatedDeliveryMinutes: normalized.estimatedDeliveryMinutes,
        lastUpdated: new Date(),
      },
      create: {
        vendorId: normalized.vendorId,
        productId: product.id,
        price: normalized.price,
        currency: normalized.currency,
        stockStatus: normalized.stockStatus,
        checkoutAvailable: normalized.checkoutAvailable,
        paymentMethods: normalized.paymentMethods,
        estimatedDeliveryMinutes: normalized.estimatedDeliveryMinutes,
      },
    });
  }
}

/** One repeatable job per enabled vendor (jobId = vendor id) so each vendor's crawl cadence, retry
 * count, and failure history are isolated in the BullMQ dashboard — a single fan-out job would hide
 * per-vendor timing/failure signal that the scoring engine's reliability inputs ultimately depend on. */
export async function scheduleCrawlJobs(): Promise<void> {
  const vendors = await prisma.vendor.findMany({ where: { enabled: true } });
  for (const vendor of vendors) {
    await crawlQueue.add(
      "crawl-vendor",
      { vendorId: vendor.id },
      { jobId: vendor.id, repeat: { every: CRAWL_INTERVAL_MINUTES * 60_000 } },
    );
  }
}
