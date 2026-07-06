import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";

/**
 * Mirrors apps/api/src/queues.ts (same queue names + a single shared connection). The two apps
 * are separate npm workspace packages that don't depend on each other, so BullMQ's Redis-backed
 * queue names — not a shared JS module — are what actually connects producer (api) and consumer
 * (worker) here.
 */
export const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const crawlQueue = new Queue("crawl", { connection });
export const executionQueue = new Queue("execution", { connection });
export const scoringQueue = new Queue("scoring", { connection });
