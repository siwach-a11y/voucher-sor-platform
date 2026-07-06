import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";

const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * Single shared connection for all three queues (crawl/execution/scoring).
 * `maxRetriesPerRequest: null` is required by BullMQ for connections handed to a Worker;
 * we set it here too so the same connection module can be mirrored by apps/worker.
 *
 * DEMO_MODE (the single-container free-tier Cloud Run deployment, see infra/docker/api-demo.Dockerfile)
 * has no Redis at all — connecting anyway would crash the process on the first unhandled connection
 * error, so queues are simply never constructed and callers must branch on DEMO_MODE first
 * (see routes/orders.ts, which runs execution synchronously instead of enqueueing).
 */
export const connection = DEMO_MODE
  ? null
  : new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null });

export const crawlQueue = connection ? new Queue("crawl", { connection }) : null;
export const executionQueue = connection ? new Queue("execution", { connection }) : null;
export const scoringQueue = connection ? new Queue("scoring", { connection }) : null;
