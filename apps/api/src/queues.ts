import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";

/**
 * Single shared connection for all three queues (crawl/execution/scoring).
 * `maxRetriesPerRequest: null` is required by BullMQ for connections handed to a Worker;
 * we set it here too so the same connection module can be mirrored by apps/worker.
 */
export const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const crawlQueue = new Queue("crawl", { connection });
export const executionQueue = new Queue("execution", { connection });
export const scoringQueue = new Queue("scoring", { connection });
