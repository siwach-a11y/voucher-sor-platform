import { Worker } from "bullmq";
import { logger } from "@voucher-sor/logger";
import { connection, scoringQueue } from "./queues.js";
import { processCrawlJob, scheduleCrawlJobs } from "./crawl.js";
import { recalculateAllScores } from "./scoring.js";
import { processExecuteOrderJob } from "./execution.js";

const log = logger.child({ app: "worker" });

const SCORING_RECALC_INTERVAL_MINUTES = Number(process.env.SCORING_RECALC_INTERVAL_MINUTES ?? 5);

const crawlWorker = new Worker("crawl", processCrawlJob, { connection });
const scoringWorker = new Worker("scoring", () => recalculateAllScores(), { connection });
const executionWorker = new Worker("execution", processExecuteOrderJob, {
  connection,
  // Retries also come from the job options set by apps/api when it enqueues "execute-order"
  // (attempts: 3, backoff: exponential 5s) — BullMQ owns retry scheduling, not this worker.
  concurrency: 1,
});

for (const worker of [crawlWorker, scoringWorker, executionWorker]) {
  worker.on("failed", (job, err) => log.error({ queue: worker.name, jobId: job?.id, err }, "Job failed"));
  worker.on("completed", (job) => log.debug({ queue: worker.name, jobId: job.id }, "Job completed"));
}

await scoringQueue.add(
  "recalculate-scores",
  {},
  { jobId: "recalculate-scores", repeat: { every: SCORING_RECALC_INTERVAL_MINUTES * 60_000 } },
);
await scheduleCrawlJobs();

log.info("Worker started: crawl, scoring, and execution queues are being processed.");
