import { BaseVendorAgent } from "@voucher-sor/vendor-agents";
import type { VoucherPayload } from "@voucher-sor/shared-types";

/**
 * Stand-in for a real per-vendor Playwright automation module. @voucher-sor/vendor-agents doesn't
 * have concrete vendor implementations yet, so every seeded vendor (vendor_a/b/c) is wired to this
 * no-op agent — it walks through the BaseVendorAgent contract and reports a synthetic success so the
 * ExecutionRouter/queue/DB-update plumbing can be exercised end to end. Swapping in a real agent
 * later is a one-line change in vendor-agent-registry.ts.
 */
export class PlaceholderVendorAgent extends BaseVendorAgent {
  async login(): Promise<void> {}

  async search(_query: string): Promise<void> {}

  async selectProduct(_productExternalId: string): Promise<void> {}

  async addToCart(): Promise<void> {}

  // No real page to read a price from — report the expected price back so the base class's drift
  // check always passes instead of always failing against a hardcoded 0.
  protected async readCurrentPrice(): Promise<number> {
    return this.expectedPriceHint;
  }

  private expectedPriceHint = 0;

  override async verifyPrice(expectedPrice: number, maxDriftPercent: number): Promise<number> {
    this.expectedPriceHint = expectedPrice;
    return super.verifyPrice(expectedPrice, maxDriftPercent);
  }

  async checkout(): Promise<void> {}

  async payment(): Promise<{ requiresUserApproval: boolean }> {
    return { requiresUserApproval: false };
  }

  async extractVoucher(): Promise<VoucherPayload> {
    return {
      code: `PLACEHOLDER-${this.vendorId}-${Date.now()}`,
      pin: null,
      serialNumber: null,
      activationInstructions: null,
      expiryDate: null,
      validated: false,
    };
  }

  async verify(voucher: VoucherPayload): Promise<boolean> {
    return voucher.code.length > 0;
  }
}
