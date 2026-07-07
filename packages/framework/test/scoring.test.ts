import { describe, expect, it } from "vitest";
import { ScoringService } from "../src/core/scoring/scoring.service.js";
import type { ScoringCandidate } from "../src/core/scoring/scoring.types.js";

function candidate(overrides: Partial<ScoringCandidate> = {}): ScoringCandidate {
  return {
    connectorId: "connector_a",
    price: 50,
    successfulOrders: 470,
    totalOrders: 500,
    averageExecutionTimeMs: 6000,
    successfulExecutions: 480,
    totalExecutions: 500,
    riskLevel: 0,
    ...overrides,
  };
}

describe("ScoringService.calculate", () => {
  it("combines all five components using the default weights", () => {
    const service = new ScoringService();
    const result = service.calculate(candidate(), 50);
    // price=1*.35 + success=.94*.25 + speed=.80*.15 + reliability=.96*.15 - risk=0*.10
    const expected = 1 * 0.35 + 0.94 * 0.25 + 0.8 * 0.15 + 0.96 * 0.15 - 0 * 0.1;
    expect(result.score).toBeCloseTo(expected, 5);
    expect(result.breakdown.priceScore).toBeCloseTo(1, 5);
  });

  it("gives the cheapest candidate a perfect price score", () => {
    const service = new ScoringService();
    const result = service.calculate(candidate({ price: 100 }), 100);
    expect(result.breakdown.priceScore).toBeCloseTo(1, 5);
  });

  it("penalizes a candidate priced above the lowest price", () => {
    const service = new ScoringService();
    const result = service.calculate(candidate({ price: 100 }), 50);
    expect(result.breakdown.priceScore).toBeCloseTo(0.5, 5);
  });

  it("scores an unproven connector (0 orders) as 0 success, not NaN", () => {
    const service = new ScoringService();
    const result = service.calculate(candidate({ successfulOrders: 0, totalOrders: 0 }), 50);
    expect(result.breakdown.successScore).toBe(0);
  });

  it("subtracts the risk score from the total, never adds it", () => {
    const service = new ScoringService();
    const safe = service.calculate(candidate({ riskLevel: 0 }), 50);
    const risky = service.calculate(candidate({ riskLevel: 1 }), 50);
    expect(risky.score).toBeLessThan(safe.score);
  });

  it("throws if weights don't sum to 1.0", () => {
    expect(() => new ScoringService({ price: 0.5, success: 0.5, speed: 0.5, reliability: 0, risk: 0 })).toThrow(/sum to 1\.0/);
  });

  it("produces a human-readable explanation mentioning the connector id", () => {
    const service = new ScoringService();
    const result = service.calculate(candidate({ connectorId: "connector_x" }), 50);
    expect(result.explanation).toContain("connector_x");
  });
});

describe("ScoringService.rank", () => {
  it("sorts candidates by final score, highest first", () => {
    const service = new ScoringService();
    const ranked = service.rank([
      candidate({ connectorId: "expensive", price: 100 }),
      candidate({ connectorId: "cheap", price: 50 }),
    ]);
    expect(ranked[0]!.connectorId).toBe("cheap");
  });

  it("returns an empty array when every candidate has a non-positive price", () => {
    const service = new ScoringService();
    expect(service.rank([candidate({ price: 0 })])).toEqual([]);
  });
});

describe("ScoringService.normalize", () => {
  it("clamps a value to [0,1] within the given range", () => {
    const service = new ScoringService();
    expect(service.normalize(5, 0, 10)).toBeCloseTo(0.5);
    expect(service.normalize(-5, 0, 10)).toBe(0);
    expect(service.normalize(15, 0, 10)).toBe(1);
  });

  it("returns 0 when the range is degenerate", () => {
    const service = new ScoringService();
    expect(service.normalize(5, 10, 10)).toBe(0);
  });
});
