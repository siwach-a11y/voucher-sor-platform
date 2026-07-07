export interface QueueJob<TPayload = unknown> {
  id: string
  type: string
  payload: TPayload
  attempts: number
  maxAttempts: number
}

/** Generic job queue contract — swap in a real backend (BullMQ, SQS, ...) by implementing this. */
export interface JobQueue {
  enqueue<TPayload>(type: string, payload: TPayload, options?: { maxAttempts?: number }): Promise<string>
  process<TPayload>(type: string, handler: (job: QueueJob<TPayload>) => Promise<void>): void
}

/** Minimal in-memory queue, sufficient for local dev/tests and as a reference implementation of
 * JobQueue. No vendor or infrastructure assumptions — a single Map plus microtask scheduling. */
export class InMemoryJobQueue implements JobQueue {
  private readonly handlers = new Map<string, (job: QueueJob) => Promise<void>>()
  private counter = 0

  async enqueue<TPayload>(type: string, payload: TPayload, options: { maxAttempts?: number } = {}): Promise<string> {
    this.counter += 1
    const job: QueueJob<TPayload> = { id: `job_${this.counter}`, type, payload, attempts: 0, maxAttempts: options.maxAttempts ?? 1 }
    const handler = this.handlers.get(type)
    if (handler) queueMicrotask(() => void this.run(job as QueueJob, handler))
    return job.id
  }

  process<TPayload>(type: string, handler: (job: QueueJob<TPayload>) => Promise<void>): void {
    this.handlers.set(type, handler as (job: QueueJob) => Promise<void>)
  }

  private async run(job: QueueJob, handler: (job: QueueJob) => Promise<void>): Promise<void> {
    job.attempts += 1
    try {
      await handler(job)
    } catch {
      if (job.attempts < job.maxAttempts) await this.run(job, handler)
    }
  }
}
