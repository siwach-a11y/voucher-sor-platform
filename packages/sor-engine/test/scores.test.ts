import { describe, expect, it } from "vitest";
import {
  priceScore,
  successScore,
  speedScore,
  stockConfidenceScore,
  reliabilityScore,
  riskPenalty,
} from "../src/scores.js";

describe("priceScore", () => {
  it("gives the cheapest vendor a perfect score", () => {
    expect(priceScore(50, 50)).toBe(1);
  });

  it("scores a more expensive vendor proportionally lower", () => {
    expect(priceScore(100, 50)).toBe(0.5);
  });

  it("clamps at 1 even if somehow below the computed lowest", () => {
    expect(priceScore(40, 50)).toBe(1);
  });

  it("treats non-positive prices as worthless", () => {
    expect(priceScore(0, 50)).toBe(0);
    expect(priceScore(-10, 50)).toBe(0);
  });
});

describe("successScore", () => {
  it("computes successful/total", () => {
    expect(successScore(470, 500)).toBeCloseTo(0.94);
  });

  it("returns 0 for a vendor with no order history rather than NaN", () => {
    expect(successScore(0, 0)).toBe(0);
  });

  it("clamps to 1 max", () => {
    expect(successScore(600, 500)).toBe(1);
  });
});

describe("speedScore", () => {
  it("scores instant checkout as 1", () => {
    expect(speedScore(0, 30_000)).toBe(1);
  });

  it("scores checkout at the max expected time as 0", () => {
    expect(speedScore(30_000, 30_000)).toBe(0);
  });

  it("clamps negative (slower than max) to 0", () => {
    expect(speedScore(60_000, 30_000)).toBe(0);
  });

  it("computes the midpoint correctly", () => {
    expect(speedScore(15_000, 30_000)).toBe(0.5);
  });
});

describe("stockConfidenceScore", () => {
  it("matches the spec's fixed lookup table", () => {
    expect(stockConfidenceScore("confirmed")).toBe(1.0);
    expect(stockConfidenceScore("recently_scraped")).toBe(0.8);
    expect(stockConfidenceScore("unknown")).toBe(0.5);
    expect(stockConfidenceScore("previously_failed")).toBe(0.2);
    expect(stockConfidenceScore("out_of_stock")).toBe(0);
  });
});

describe("reliabilityScore", () => {
  it("computes successful/total executions", () => {
    expect(reliabilityScore(480, 500)).toBeCloseTo(0.96);
  });

  it("returns 0 for a vendor never executed", () => {
    expect(reliabilityScore(0, 0)).toBe(0);
  });
});

describe("riskPenalty", () => {
  it("matches the spec's fixed lookup table", () => {
    expect(riskPenalty("none")).toBe(0);
    expect(riskPenalty("light")).toBe(0.2);
    expect(riskPenalty("heavy")).toBe(0.5);
    expect(riskPenalty("otp")).toBe(0.8);
    expect(riskPenalty("checkout_failure")).toBe(1.0);
  });
});
