import { describe, expect, it, vi } from "vitest";
import type { Browser, BrowserContext, Page } from "playwright";
import type { ExecutionRequest, ExecutionResult, VoucherPayload } from "@voucher-sor/shared-types";
import { ExecutionRouter, type VendorAgentFactory } from "../src/core/execution-router.js";
import type { RunnableVendorAgent } from "../src/core/base-vendor-agent.js";

// Fake VendorAgent/Browser/Context/Page objects only — no real Playwright browser is ever launched
// or network touched here. Real-browser behavior belongs in integration tests, out of scope for
// this package.

function makeRequest(overrides: Partial<ExecutionRequest> = {}): ExecutionRequest {
  return {
    orderId: "order_1",
    vendorId: "vendor_a",
    productExternalId: "prod_1",
    productName: "Test Voucher",
    expectedPrice: 50,
    currency: "USD",
    maxPriceDriftPercent: 5,
    ...overrides,
  };
}

function makeResult(overrides: Partial<ExecutionResult> = {}): ExecutionResult {
  const voucher: VoucherPayload = {
    code: "ABC123",
    pin: null,
    serialNumber: null,
    activationInstructions: null,
    expiryDate: null,
    validated: true,
  };
  return {
    orderId: "order_1",
    vendorId: "vendor_a",
    success: true,
    purchasePrice: 50,
    voucher,
    executionTimeMs: 10,
    failureReason: null,
    failureStage: null,
    requiredUserApproval: false,
    ...overrides,
  };
}

function makeFakeAgent(run: (request: ExecutionRequest) => Promise<ExecutionResult>) {
  const dispose = vi.fn(async () => undefined);
  const agent: RunnableVendorAgent = {
    vendorId: "vendor_a",
    login: vi.fn(async () => undefined),
    search: vi.fn(async () => undefined),
    selectProduct: vi.fn(async () => undefined),
    addToCart: vi.fn(async () => undefined),
    verifyPrice: vi.fn(async () => 50),
    checkout: vi.fn(async () => undefined),
    payment: vi.fn(async () => ({ requiresUserApproval: false })),
    extractVoucher: vi.fn(async () => makeResult().voucher as VoucherPayload),
    verify: vi.fn(async () => true),
    returnResult: vi.fn(async () => makeResult()),
    dispose,
    runFullPurchaseFlow: vi.fn(run),
  };
  return { agent, dispose };
}

function makeFakeBrowser() {
  const page = {} as Page;
  const context = {
    newPage: vi.fn(async () => page),
    close: vi.fn(async () => undefined),
  } as unknown as BrowserContext;
  const browser = {
    newContext: vi.fn(async () => context),
  } as unknown as Browser;
  return { browser, context, page };
}

describe("ExecutionRouter", () => {
  it("routes to the factory registered for the request's vendorId", async () => {
    const { browser } = makeFakeBrowser();
    const { agent } = makeFakeAgent(async (req) => makeResult({ orderId: req.orderId }));
    const factoryA: VendorAgentFactory = vi.fn(() => agent);
    const factoryB: VendorAgentFactory = vi.fn(() => agent);

    const router = new ExecutionRouter({
      agentFactories: { vendor_a: factoryA, vendor_b: factoryB },
      browser,
    });
    const result = await router.execute(makeRequest({ vendorId: "vendor_a" }));

    expect(factoryA).toHaveBeenCalledTimes(1);
    expect(factoryB).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("always disposes the agent, even when the run throws", async () => {
    const { browser } = makeFakeBrowser();
    const { agent, dispose } = makeFakeAgent(async () => {
      throw new Error("boom");
    });
    const factory: VendorAgentFactory = () => agent;
    const router = new ExecutionRouter({ agentFactories: { vendor_a: factory }, browser });

    await expect(router.execute(makeRequest())).rejects.toThrow("boom");
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("throws a clear error for an unregistered vendorId instead of swallowing it", async () => {
    const { browser } = makeFakeBrowser();
    const router = new ExecutionRouter({ agentFactories: {}, browser });

    await expect(router.execute(makeRequest({ vendorId: "unknown_vendor" }))).rejects.toThrow(/unknown_vendor/);
  });
});
