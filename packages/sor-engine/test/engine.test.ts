import { describe, expect, it } from "vitest";
import { DEFAULT_SCORING_WEIGHTS } from "@voucher-sor/shared-types";
import { decideRoute, rankOffers, scoreOffer } from "../src/engine.js";
import { validateWeights } from "../src/validate-weights.js";
import type { ScoringCandidate } from "../src/types.js";

function candidate(overrides: Partial<ScoringCandidate> = {}): ScoringCandidate {
  return {
    vendorId: "vendor_a",
    offerId: "offer_a",
    price: 50,
    stockStatus: "confirmed",
    averageCheckoutTimeMs: 6000,
    successfulOrders: 470,
    totalOrders: 500,
    successfulExecutions: 480,
    totalExecutions: 500,
    lastCaptchaLevel: "none",
    eligible: true,
    ...overrides,
  };
}

describe("scoreOffer", () => {
  it("combines all six components using the default weights", () => {
    const result = scoreOffer(candidate(), 50);
    // price=1*.35 + success=.94*.20 + speed=.80*.15 + stock=1*.10 + reliability=.96*.10 - risk=0*.10
    const expected = 1 * 0.35 + 0.94 * 0.2 + 0.8 * 0.15 + 1 * 0.1 + 0.96 * 0.1 - 0 * 0.1;
    expect(result.finalScore).toBeCloseTo(expected, 5);
  });

  it("never lets DEFAULT_SCORING_WEIGHTS drift from summing to 1.0", () => {
    expect(() => validateWeights(DEFAULT_SCORING_WEIGHTS)).not.toThrow();
  });

  it("applies the risk penalty as a subtraction, not a multiplier on the rest", () => {
    const clean = scoreOffer(candidate({ lastCaptchaLevel: "none" }), 50);
    const risky = scoreOffer(candidate({ lastCaptchaLevel: "checkout_failure" }), 50);
    expect(clean.finalScore - risky.finalScore).toBeCloseTo(DEFAULT_SCORING_WEIGHTS.risk, 5);
  });

  it("respects custom weight configuration", () => {
    const priceOnly = { price: 1, successRate: 0, checkoutSpeed: 0, stockConfidence: 0, reliability: 0, risk: 0 };
    // lowestPrice=50, vendorPrice=100 -> priceScore = 50/100 = 0.5
    const result = scoreOffer(candidate({ price: 100 }), 50, { weights: priceOnly });
    expect(result.finalScore).toBeCloseTo(0.5, 5);
  });
});

describe("rankOffers", () => {
  it("excludes ineligible and out-of-stock candidates from the lowest-price baseline", () => {
    const ranked = rankOffers([
      candidate({ vendorId: "vendor_a", price: 10, eligible: false, ineligibleReason: "disabled" }),
      candidate({ vendorId: "vendor_b", price: 100 }),
      candidate({ vendorId: "vendor_c", price: 200, stockStatus: "out_of_stock" }),
    ]);
    expect(ranked).toHaveLength(1);
    expect(ranked[0]!.vendorId).toBe("vendor_b");
    // Lowest price among ELIGIBLE candidates is 100, not the disabled vendor's 10.
    expect(ranked[0]!.priceScore).toBe(1);
  });

  it("sorts highest final score first", () => {
    const ranked = rankOffers([
      candidate({ vendorId: "cheap_but_risky", price: 10, lastCaptchaLevel: "checkout_failure" }),
      candidate({ vendorId: "fair_and_safe", price: 50, lastCaptchaLevel: "none" }),
    ]);
    expect(ranked[0]!.finalScore).toBeGreaterThanOrEqual(ranked[1]!.finalScore);
  });

  it("returns an empty array when every candidate is ineligible", () => {
    expect(rankOffers([candidate({ eligible: false })])).toEqual([]);
  });
});

describe("decideRoute", () => {
  it("never picks the cheapest vendor by price alone when its risk/reliability is worse", () => {
    // Vendor A: cheapest but heavy CAPTCHA + poor reliability.
    // Vendor B: slightly pricier but clean risk profile and near-perfect reliability.
    const decision = decideRoute("prod_1", [
      candidate({
        vendorId: "vendor_a",
        offerId: "offer_a",
        price: 40,
        lastCaptchaLevel: "heavy",
        successfulExecutions: 250,
        totalExecutions: 500,
      }),
      candidate({
        vendorId: "vendor_b",
        offerId: "offer_b",
        price: 45,
        lastCaptchaLevel: "none",
        successfulExecutions: 495,
        totalExecutions: 500,
      }),
    ]);

    expect(decision.selectedVendorId).toBe("vendor_b");
    expect(decision.decisionReason).toContain("vendor_b");
    expect(decision.decisionReason).toContain("beating runner-up vendor_a");
  });

  it("reports no eligible vendors instead of throwing", () => {
    const decision = decideRoute("prod_1", [candidate({ stockStatus: "out_of_stock" })]);
    expect(decision.selectedVendorId).toBeNull();
    expect(decision.decisionReason).toContain("No eligible vendors");
  });

  it("throws on a misconfigured weight set instead of silently normalizing it", () => {
    expect(() => decideRoute("prod_1", [candidate()], { weights: { ...DEFAULT_SCORING_WEIGHTS, price: 0.9 } })).toThrow(
      /must sum to 1.0/,
    );
  });
});
