import type { Browser, BrowserContext, Page } from "playwright";
import type { ExecutionRequest, ExecutionResult } from "@voucher-sor/shared-types";
import { logger } from "@voucher-sor/logger";
import type { RunnableVendorAgent } from "./base-vendor-agent.js";

export type VendorAgentFactory = (context: BrowserContext, page: Page) => RunnableVendorAgent;

export class ExecutionRouter {
  private readonly agentFactories: Record<string, VendorAgentFactory>;
  private readonly browser: Browser;

  constructor(deps: { agentFactories: Record<string, VendorAgentFactory>; browser: Browser }) {
    this.agentFactories = deps.agentFactories;
    this.browser = deps.browser;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const factory = this.agentFactories[request.vendorId];
    if (!factory) {
      // No agent registered for this vendorId is a routing/config bug (the SOR engine picked a
      // vendor no one wired up an automation module for), not a runtime condition to swallow into
      // a failed ExecutionResult — fail loudly so it gets fixed, not silently retried forever.
      throw new Error(`No vendor agent registered for vendorId "${request.vendorId}"`);
    }

    logger.info({ orderId: request.orderId, vendorId: request.vendorId }, "Execution router: starting order");

    // One brand-new, isolated BrowserContext (and Page) per order — never shared or reused across
    // orders. This is the hard isolation boundary that keeps one customer's cookies/session/cart
    // completely out of another's run; see the invariant documented on BaseVendorAgent.
    const context = await this.browser.newContext();
    const page = await context.newPage();
    const agent = factory(context, page);

    try {
      const result = await agent.runFullPurchaseFlow(request);
      logger.info(
        { orderId: request.orderId, vendorId: request.vendorId, success: result.success },
        "Execution router: order finished",
      );
      return result;
    } finally {
      // Always released, even on failure/throw — the caller should never need its own try/catch
      // around this call just to guarantee cleanup.
      await agent.dispose();
    }
  }
}
