import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import type { VendorConnector } from './connector.interface.js'
import type { PurchaseRequest, PurchaseResult, SearchRequest, SearchResult, VerificationResult, VerifyRequest } from '../../domain/index.js'

export interface PlaywrightConnectorOptions {
  headless?: boolean
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Abstract base for a real vendor's Playwright automation module. Provides reusable browser
 * lifecycle utilities only — login/search/buy/verify carry no implementation here. A concrete
 * vendor connector is created by extending this class in your OWN project; see
 * src/connectors/README.md. This class must never import or reference a real vendor.
 */
export abstract class PlaywrightConnector implements VendorConnector {
  abstract readonly id: string
  abstract readonly name: string

  protected browser: Browser | null = null

  constructor(protected readonly options: PlaywrightConnectorOptions = {}) {}

  /** Launches (or reuses) the underlying browser. Call before opening a context. */
  protected async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: this.options.headless ?? true })
    }
    return this.browser
  }

  /** One brand-new, isolated context per operation — never share a context across orders. */
  protected async newContext(): Promise<BrowserContext> {
    const browser = await this.ensureBrowser()
    return browser.newContext()
  }

  /** Captures a screenshot for execution audit trails — purely a browser utility, no vendor logic. */
  protected async screenshot(page: Page): Promise<Buffer> {
    return page.screenshot({ fullPage: true })
  }

  /** Retries a flaky step with exponential backoff — real vendor sites are inherently unreliable. */
  protected async withRetry<T>(fn: () => Promise<T>, maxAttempts = 2, baseDelayMs = 500): Promise<T> {
    let attempt = 0
    for (;;) {
      try {
        return await fn()
      } catch (error) {
        attempt += 1
        if (attempt >= maxAttempts) throw error
        await delay(baseDelayMs * 2 ** (attempt - 1))
      }
    }
  }

  /** Releases the browser. Must be called once this connector instance is no longer needed. */
  async dispose(): Promise<void> {
    await this.browser?.close()
    this.browser = null
  }

  /** Authenticates with the vendor site, if required. Implemented by the concrete connector. */
  protected abstract login(context: BrowserContext, page: Page): Promise<void>

  // VendorConnector contract — every method below must be implemented by a concrete subclass.
  // This class deliberately provides no default behavior for any of them.
  abstract search(request: SearchRequest): Promise<SearchResult[]>
  abstract buy(request: PurchaseRequest): Promise<PurchaseResult>
  abstract verify(request: VerifyRequest): Promise<VerificationResult>
}
