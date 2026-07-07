import type { VendorConnector } from '../../connectors/index.js'
import type { PurchaseRequest, PurchaseResult } from '../../domain/index.js'
import type { EventBus } from '../events/index.js'

export interface ExecutionEngineOptions {
  maxAttempts?: number
  timeoutMs?: number
}

export interface ExecutionLogEntry {
  orderId: string
  connectorId: string
  attempt: number
  outcome: 'success' | 'failure'
  message: string
  screenshot?: Buffer | null
  timestamp: string
}

/** Optional capability a connector may implement so ExecutionEngine can attach a screenshot to a
 * failed attempt for diagnostics — purely additive, never required by the base VendorConnector contract. */
export interface CapturesScreenshots {
  captureScreenshot(): Promise<Buffer | null>
}

interface Disposable {
  dispose(): Promise<void>
}

function supportsScreenshots(connector: VendorConnector): connector is VendorConnector & CapturesScreenshots {
  return typeof (connector as Partial<CapturesScreenshots>).captureScreenshot === 'function'
}

function isDisposable(connector: VendorConnector): connector is VendorConnector & Disposable {
  return typeof (connector as Partial<Disposable>).dispose === 'function'
}

/**
 * Owns everything about running a purchase against a connector: browser/resource lifecycle
 * (disposing the connector afterwards), retries, timeouts, screenshot capture on failure, an
 * in-memory execution log, and event publishing. No browser automation logic lives outside this
 * class and the connector itself — routing/scoring never touch a connector directly for execution.
 */
export class ExecutionEngine {
  private readonly logs: ExecutionLogEntry[] = []

  constructor(
    private readonly eventBus: EventBus,
    private readonly options: ExecutionEngineOptions = {},
  ) {}

  async execute(connector: VendorConnector, request: PurchaseRequest): Promise<PurchaseResult> {
    const maxAttempts = this.options.maxAttempts ?? 2
    const timeoutMs = this.options.timeoutMs ?? 60_000

    this.eventBus.publish({
      type: 'execution.started',
      connectorId: connector.id,
      orderId: request.orderId,
      message: `Starting execution on ${connector.name}`,
    })

    try {
      let lastError: unknown
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const result = await this.withTimeout(connector.buy(request), timeoutMs)
          this.record({
            orderId: request.orderId,
            connectorId: connector.id,
            attempt,
            outcome: result.success ? 'success' : 'failure',
            message: result.failureReason ?? 'Execution completed',
          })
          this.eventBus.publish({
            type: result.success ? 'execution.completed' : 'execution.failed',
            connectorId: connector.id,
            orderId: request.orderId,
            message: result.failureReason ?? 'Execution completed',
          })
          return result
        } catch (error) {
          lastError = error
          const message = error instanceof Error ? error.message : String(error)
          const screenshot = supportsScreenshots(connector) ? await connector.captureScreenshot().catch(() => null) : null
          this.record({ orderId: request.orderId, connectorId: connector.id, attempt, outcome: 'failure', message, screenshot })

          if (attempt >= maxAttempts) break
          this.eventBus.publish({
            type: 'execution.retrying',
            connectorId: connector.id,
            orderId: request.orderId,
            message: `Attempt ${attempt} failed: ${message}`,
          })
        }
      }

      const failureReason = lastError instanceof Error ? lastError.message : String(lastError ?? 'Unknown execution failure')
      this.eventBus.publish({ type: 'execution.failed', connectorId: connector.id, orderId: request.orderId, message: failureReason })
      return {
        orderId: request.orderId,
        connectorId: connector.id,
        success: false,
        purchasePrice: null,
        confirmationCode: null,
        executionTimeMs: 0,
        failureReason,
        requiresUserApproval: false,
      }
    } finally {
      if (isDisposable(connector)) await connector.dispose()
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Execution timed out after ${timeoutMs}ms`)), timeoutMs)),
    ])
  }

  private record(entry: Omit<ExecutionLogEntry, 'timestamp'>): void {
    this.logs.push({ ...entry, timestamp: new Date().toISOString() })
  }

  getLogs(orderId?: string): ExecutionLogEntry[] {
    return orderId ? this.logs.filter((entry) => entry.orderId === orderId) : [...this.logs]
  }
}
