import { describe, expect, it, vi } from "vitest";
import type { BrowserContext, Page } from "playwright";
import type { ExecutionRequest, VoucherPayload } from "@voucher-sor/shared-types";
import { BaseVendorAgent } from "../src/core/base-vendor-agent.js";

// Minimal stubs for the only Playwright surface BaseVendorAgent itself touches (context.close()).
// No real browser/page is launched — real-browser behavior belongs in integration tests.

function makeFakeContext() {
  return { close: vi.fn(async () => undefined) } as unknown as BrowserContext;
}

function makeFakePage() {
  return {} as Page;
}

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

const sampleVoucher: VoucherPayload = {
  code: "ABC123",
  pin: null,
  serialNumber: null,
  activationInstructions: null,
  expiryDate: null,
  validated: false,
};

/** Minimal concrete subclass whose abstract hooks are all vi.fn() mocks for test control. */
class TestVendorAgent extends BaseVendorAgent {
  login = vi.fn(async () => undefined);
  search = vi.fn(async () => undefined);
  selectProduct = vi.fn(async () => undefined);
  addToCart = vi.fn(async () => undefined);
  checkout = vi.fn(async () => undefined);
  payment = vi.fn(async (): Promise<{ requiresUserApproval: boolean }> => ({ requiresUserApproval: false }));
  extractVoucher = vi.fn(async () => ({ ...sampleVoucher }));
  verify = vi.fn(async () => true);
  protected readCurrentPrice = vi.fn(async () => 50);

  /** Test helper: readCurrentPrice is protected, so mutate it from inside the class. */
  setMockPrice(price: number): void {
    this.readCurrentPrice = vi.fn(async () => price);
  }
}

describe("BaseVendorAgent.runFullPurchaseFlow", () => {
  it("retries a failing stage and succeeds once it recovers", async () => {
    const agent = new TestVendorAgent("vendor_a", makeFakeContext(), makeFakePage());
    let attempts = 0;
    agent.addToCart = vi.fn(async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error("transient glitch");
      }
    });

    const result = await agent.runFullPurchaseFlow(makeRequest());

    expect(attempts).toBe(2);
    expect(result.success).toBe(true);
    expect(result.failureStage).toBeNull();
  });

  it("wraps a stage that fails on every attempt as a stage-tagged failure", async () => {
    const agent = new TestVendorAgent("vendor_a", makeFakeContext(), makeFakePage());
    agent.login = vi.fn(async () => {
      throw new Error("site down");
    });

    const result = await agent.runFullPurchaseFlow(makeRequest());

    expect(agent.login).toHaveBeenCalledTimes(2); // default maxAttempts = 2
    expect(result.success).toBe(false);
    expect(result.failureStage).toBe("login");
    expect(result.failureReason).toMatch(/site down/);
  });

  it("pauses instead of failing when payment requires OTP/3-D Secure approval", async () => {
    const agent = new TestVendorAgent("vendor_a", makeFakeContext(), makeFakePage());
    agent.payment = vi.fn(async () => ({ requiresUserApproval: true }));

    const result = await agent.runFullPurchaseFlow(makeRequest());

    expect(result.success).toBe(false);
    expect(result.requiredUserApproval).toBe(true);
    expect(result.failureReason).toMatch(/awaiting user approval/i);
    expect(agent.extractVoucher).not.toHaveBeenCalled();
  });

  it("fails the run when the live price drifts beyond the allowed threshold", async () => {
    const agent = new TestVendorAgent("vendor_a", makeFakeContext(), makeFakePage());
    agent.setMockPrice(100);

    const result = await agent.runFullPurchaseFlow(makeRequest({ expectedPrice: 50, maxPriceDriftPercent: 5 }));

    expect(result.success).toBe(false);
    expect(result.failureReason).toMatch(/drift/i);
  });
});

describe("BaseVendorAgent.dispose", () => {
  it("closes the underlying browser context", async () => {
    const context = makeFakeContext();
    const agent = new TestVendorAgent("vendor_a", context, makeFakePage());

    await agent.dispose();

    expect(context.close).toHaveBeenCalledTimes(1);
  });
});
