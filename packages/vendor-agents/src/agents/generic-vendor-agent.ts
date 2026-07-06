import type { BrowserContext, Page } from "playwright";
import type { VoucherPayload } from "@voucher-sor/shared-types";
import { BaseVendorAgent } from "../core/base-vendor-agent.js";

/**
 * Configurable CSS selectors for one vendor's checkout flow. Wiring up a new vendor with a
 * GenericVendorAgent + this config is the fast path for onboarding — see the package README.
 */
export interface VendorSelectorConfig {
  loginUrl?: string;
  usernameSelector?: string;
  passwordSelector?: string;
  loginSubmitSelector?: string;
  credentials?: { username: string; password: string };
  searchInputSelector: string;
  productLinkSelector: string;
  addToCartSelector: string;
  checkoutButtonSelector: string;
  priceSelector: string;
  paymentSubmitSelector: string;
  /** Presence of this field on the page after submitting payment signals an OTP/3-D Secure prompt. */
  otpFieldSelector?: string;
  voucherCodeSelector: string;
  voucherPinSelector?: string;
}

/**
 * Example only: selectors referenced below are illustrative placeholders, not verified against any
 * real vendor site. Wire real selectors into VendorSelectorConfig when onboarding an actual supplier
 * — this class is meant to be reused/configured, not subclassed, for the common case.
 */
export class GenericVendorAgent extends BaseVendorAgent {
  constructor(
    vendorId: string,
    context: BrowserContext,
    page: Page,
    private readonly selectors: VendorSelectorConfig,
  ) {
    super(vendorId, context, page);
  }

  async login(): Promise<void> {
    if (!this.selectors.loginUrl || !this.selectors.credentials) {
      return;
    }
    await this.page.goto(this.selectors.loginUrl);
    await this.page.fill(this.selectors.usernameSelector ?? "#username", this.selectors.credentials.username);
    await this.page.fill(this.selectors.passwordSelector ?? "#password", this.selectors.credentials.password);
    await this.page.click(this.selectors.loginSubmitSelector ?? "#login-submit");
  }

  async search(query: string): Promise<void> {
    await this.page.fill(this.selectors.searchInputSelector, query);
    await this.page.keyboard.press("Enter");
  }

  async selectProduct(productExternalId: string): Promise<void> {
    await this.page.click(`${this.selectors.productLinkSelector}[data-product-id="${productExternalId}"]`);
  }

  async addToCart(): Promise<void> {
    await this.page.click(this.selectors.addToCartSelector);
  }

  async checkout(): Promise<void> {
    await this.page.click(this.selectors.checkoutButtonSelector);
  }

  async payment(): Promise<{ requiresUserApproval: boolean }> {
    if (this.selectors.otpFieldSelector) {
      const otpFieldCount = await this.page.locator(this.selectors.otpFieldSelector).count();
      if (otpFieldCount > 0) {
        // Never fill in the OTP/3-D Secure field automatically — surface it for human approval.
        return { requiresUserApproval: true };
      }
    }
    await this.page.click(this.selectors.paymentSubmitSelector);
    return { requiresUserApproval: false };
  }

  async extractVoucher(): Promise<VoucherPayload> {
    const code = (await this.page.locator(this.selectors.voucherCodeSelector).textContent()) ?? "";
    const pin = this.selectors.voucherPinSelector
      ? await this.page.locator(this.selectors.voucherPinSelector).textContent()
      : null;
    return {
      code: code.trim(),
      pin: pin?.trim() ?? null,
      serialNumber: null,
      activationInstructions: null,
      expiryDate: null,
      validated: false,
    };
  }

  async verify(voucher: VoucherPayload): Promise<boolean> {
    return voucher.code.length > 0;
  }

  protected async readCurrentPrice(): Promise<number> {
    const text = (await this.page.locator(this.selectors.priceSelector).textContent()) ?? "0";
    const numeric = Number(text.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }
}
