import type { EventBus } from '../events/index.js'

/** The only three job kinds the framework knows about — generic maintenance work, never tied to
 * a vendor. The host application supplies what each job actually does via `run`. */
export type SchedulerJobName = 'refreshOffers' | 'refreshHealth' | 'retryOrders'

export interface SchedulerJob {
  name: SchedulerJobName
  intervalMs: number
  run: () => Promise<void>
}

export class Scheduler {
  private readonly timers = new Map<SchedulerJobName, ReturnType<typeof setInterval>>()

  constructor(private readonly eventBus: EventBus) {}

  register(job: SchedulerJob): void {
    if (this.timers.has(job.name)) throw new Error(`Job "${job.name}" is already scheduled`)
    const timer = setInterval(() => void this.runJob(job), job.intervalMs)
    this.timers.set(job.name, timer)
  }

  unregister(name: SchedulerJobName): void {
    const timer = this.timers.get(name)
    if (timer) clearInterval(timer)
    this.timers.delete(name)
  }

  list(): SchedulerJobName[] {
    return [...this.timers.keys()]
  }

  private async runJob(job: SchedulerJob): Promise<void> {
    this.eventBus.publish({ type: 'scheduler.job.started', message: `Running job "${job.name}"` })
    try {
      await job.run()
      this.eventBus.publish({ type: 'scheduler.job.completed', message: `Job "${job.name}" completed` })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.eventBus.publish({ type: 'scheduler.job.failed', message: `Job "${job.name}" failed: ${message}` })
    }
  }

  /** Stops every registered job — call on process shutdown. */
  stopAll(): void {
    for (const timer of this.timers.values()) clearInterval(timer)
    this.timers.clear()
  }
}
