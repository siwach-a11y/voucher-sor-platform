import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, mergeConfig } from "../src/config/config.loader.js";

describe("mergeConfig", () => {
  it("returns the base config untouched when no override is given", () => {
    expect(mergeConfig(DEFAULT_CONFIG, {})).toEqual(DEFAULT_CONFIG);
  });

  it("overrides only the enabled connector list, not the whole connectors object", () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { connectors: { enabled: ["a", "b"] } });
    expect(merged.connectors.enabled).toEqual(["a", "b"]);
  });

  it("shallow-merges routing weights over the defaults", () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { routing: { weights: { price: 0.5 } as never } });
    expect(merged.routing.weights.price).toBe(0.5);
    expect(merged.routing.weights.success).toBe(DEFAULT_CONFIG.routing.weights.success);
  });

  it("merges execution overrides", () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { execution: { maxAttempts: 5 } as never });
    expect(merged.execution.maxAttempts).toBe(5);
    expect(merged.execution.timeoutMs).toBe(DEFAULT_CONFIG.execution.timeoutMs);
  });
});
