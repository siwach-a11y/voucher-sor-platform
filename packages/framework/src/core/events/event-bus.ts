export type FrameworkEventType =
  | 'search.started'
  | 'search.completed'
  | 'routing.decided'
  | 'execution.started'
  | 'execution.retrying'
  | 'execution.completed'
  | 'execution.failed'
  | 'scheduler.job.started'
  | 'scheduler.job.completed'
  | 'scheduler.job.failed'

export interface FrameworkEvent<TMetadata = unknown> {
  type: FrameworkEventType
  connectorId?: string
  orderId?: string
  message: string
  metadata?: TMetadata
  timestamp: string
}

type Listener = (event: FrameworkEvent) => void

/** Generic pub/sub for framework lifecycle events. No vendor knowledge — publishers/subscribers
 * only ever pass connector ids, order ids, and plain messages/metadata. */
export class EventBus {
  private readonly listeners = new Map<FrameworkEventType, Set<Listener>>()

  on(type: FrameworkEventType, listener: Listener): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(listener)
    return () => this.listeners.get(type)?.delete(listener)
  }

  publish(event: Omit<FrameworkEvent, 'timestamp'>): void {
    const full: FrameworkEvent = { ...event, timestamp: new Date().toISOString() }
    this.listeners.get(event.type)?.forEach((listener) => listener(full))
  }
}
