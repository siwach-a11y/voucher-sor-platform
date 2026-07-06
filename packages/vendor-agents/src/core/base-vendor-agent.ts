import type { BrowserContext, Page } from "playwright";
import type {
  ExecutionRequest,
  ExecutionResult,
  VendorAgent,
  VendorAgentStage,
  VoucherPayload,
} from "@voucher-sor/shared-types";
import { PriceMismatchError, VendorAgentStepError } from "@voucher-sor/shared-types";
import { logEvent, logger } from "@voucher-sor/logger";

const RETRY_BASE_DELAY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * VendorAgent (shared-types, not modified here) plus the single orchestration entry point the
 * Execution Router actually calls. shared-types has no room for this method since it only declares
 * the individual lifecycle steps; this interface is the "runnable" superset BaseVendorAgent provides.
 */
export interface RunnableVendorAgent extends VendorAgent {
  runFullPurchaseFlow(request: ExecutionRequest): Promise<ExecutionResult>;
}

/**
 * Abstract base for every vendor's Playwright automation module.
 *
 * HARD INVARIANT: one instance backs exactly ONE order and must be constructed with a brand-new,
 * isolated BrowserContext + Page. Never reuse an instance — or its context — across orders. Doing so
 * would leak cookies/sessions/local-storage between customers and defeats the whole point of the
 * isolation boundary the Execution Router relies on. Always: one order -> one factory call -> one
 * fresh context -> dispose() -> discard.
 *
 * The lifecycle steps (login/search/.../verify) are declared public here, not protected, even though
 * they are implementation hooks meant only for subclasses to fill in and for runFullPurchaseFlow to
 * call in order. VendorAgent (shared-types) declares them as public interface members, and TypeScript
 * does not allow a class to narrow an implemented interface member to protected — so "protected" per
 * the original design intent is expressed here only as a documentation convention: callers other than
 * runFullPurchaseFlow should not invoke these directly.
 */
export abstract class BaseVendorAgent implements RunnableVendorAgent {
  protected readonly context: BrowserContext;
  protected readonly page: Page;

  private request: ExecutionRequest | null = null;
  private runStartedAt = 0;
  private observedPurchasePrice: number | null = null;
  private extractedVoucher: VoucherPayload | null = null;
  private succeeded = false;
  private failureReason: string | null = null;
  private failureStage: VendorAgentStage | null = null;
  private awaitingApproval = false;

  constructor(public readonly vendorId: string, browserContext: BrowserContext, page: Page) {
    this.context = browserContext;
    this.page = page;
  }

  abstract login(): Promise<void>;
  abstract search(query: string): Promise<void>;
  abstract selectProduct(productExternalId: string): Promise<void>;
  abstract addToCart(): Promise<void>;
  abstract checkout(): Promise<void>;
  abstract payment(): Promise<{ requiresUserApproval: boolean }>;
  abstract extractVoucher(): Promise<VoucherPayload>;
  abstract verify(voucher: VoucherPayload): Promise<boolean>;

  /** Hook for subclasses: read the live price shown on the page right now, in `currency` units. */
  protected abstract readCurrentPrice(): Promise<number>;

  async verifyPrice(expectedPrice: number, maxDriftPercent: number): Promise<number> {
    const actualPrice = await this.readCurrentPrice();
    const driftPercent = expectedPrice === 0 ? 0 : (Math.abs(actualPrice - expectedPrice) / expectedPrice) * 100;
    if (driftPercent > maxDriftPercent) {
      throw new PriceMismatchError(expectedPrice, actualPrice);
    }
    this.observedPurchasePrice = actualPrice;
    return actualPrice;
  }

  /**
   * Retries a stage up to maxAttempts times with exponential backoff (500ms, 1000ms, ...) before
   * giving up — Playwright automation against real vendor sites is flaky by nature (slow renders,
   * transient network blips), so a single failed attempt should not fail the whole order outright.
   * On exhaustion, the underlying error is re-thrown as a VendorAgentStepError tagged with the stage
   * that failed, so runFullPurchaseFlow can report failureStage without each stage doing it itself.
   */
  private async withRetry<T>(stage: VendorAgentStage, fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
    let attempt = 0;
    for (;;) {
      try {
        return await fn();
      } catch (error) {
        attempt += 1;
        if (attempt >= maxAttempts) {
          const message = error instanceof Error ? error.message : String(error);
          throw new VendorAgentStepError(stage, `Stage "${stage}" failed after ${attempt} attempt(s): ${message}`, error);
        }
        await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }

  async runFullPurchaseFlow(request: ExecutionRequest): Promise<ExecutionResult> {
    this.request = request;
    this.runStartedAt = Date.now();
    try {
      await this.withRetry("login", () => this.login());
      await this.withRetry("search", () => this.search(request.productName));
      await this.withRetry("selectProduct", () => this.selectProduct(request.productExternalId));
      await this.withRetry("addToCart", () => this.addToCart());
      // verifyPrice has no dedicated entry in VendorAgentStage; a mismatch is tagged as a
      // "checkout" failure since it's the price gate that guards entry into checkout.
      await this.withRetry("checkout", () => this.verifyPrice(request.expectedPrice, request.maxPriceDriftPercent));
      await this.withRetry("checkout", () => this.checkout());

      const paymentResult = await this.withRetry("payment", () => this.payment());
      if (paymentResult.requiresUserApproval) {
        // Not a failure: OTP/3-D Secure needs a human in the loop. Pause here instead of throwing so
        // the worker can persist order status "awaiting_user_approval" and resume this same order
        // later — never attempt to complete OTP/3DS automatically.
        logEvent("payment_failure", {
          vendorId: this.vendorId,
          orderId: request.orderId,
          message: "Payment paused pending user approval (OTP/3-D Secure)",
        });
        this.awaitingApproval = true;
        return this.returnResult();
      }

      const voucher = await this.withRetry("extractVoucher", () => this.extractVoucher());
      this.extractedVoucher = voucher;

      await this.withRetry("verify", async () => {
        const ok = await this.verify(voucher);
        if (!ok) {
          throw new Error("Voucher failed verification");
        }
        return ok;
      });
      voucher.validated = true;
      this.succeeded = true;

      return this.returnResult();
    } catch (error) {
      if (error instanceof VendorAgentStepError) {
        this.failureStage = error.stage;
        this.failureReason = error.message;
      } else {
        this.failureReason = error instanceof Error ? error.message : String(error);
      }
      logger.error(
        { vendorId: this.vendorId, orderId: request.orderId, stage: this.failureStage, err: error },
        "Vendor agent execution failed",
      );
      return this.returnResult();
    }
  }

  async returnResult(): Promise<ExecutionResult> {
    return {
      orderId: this.request?.orderId ?? "",
      vendorId: this.vendorId,
      success: this.succeeded,
      purchasePrice: this.observedPurchasePrice,
      voucher: this.extractedVoucher,
      executionTimeMs: this.runStartedAt === 0 ? 0 : Date.now() - this.runStartedAt,
      failureReason: this.awaitingApproval ? "awaiting user approval (OTP/3-D Secure)" : this.failureReason,
      failureStage: this.failureStage,
      requiredUserApproval: this.awaitingApproval,
    };
  }

  async dispose(): Promise<void> {
    await this.context.close();
  }
}
