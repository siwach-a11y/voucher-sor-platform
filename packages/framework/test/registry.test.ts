import { describe, expect, it } from "vitest";
import { ConnectorRegistry } from "../src/connectors/registry.js";
import type { VendorConnector } from "../src/connectors/base/connector.interface.js";

function stubConnector(id: string): VendorConnector {
  return {
    id,
    name: `Stub ${id}`,
    search: async () => [],
    buy: async () => {
      throw new Error("not implemented in stub");
    },
    verify: async () => ({ verified: false }),
  };
}

describe("ConnectorRegistry", () => {
  it("registers and retrieves a connector by id", () => {
    const registry = new ConnectorRegistry();
    const connector = stubConnector("a");
    registry.register(connector);
    expect(registry.get("a")).toBe(connector);
  });

  it("lists every registered connector", () => {
    const registry = new ConnectorRegistry();
    registry.register(stubConnector("a"));
    registry.register(stubConnector("b"));
    expect(registry.list().map((c) => c.id).sort()).toEqual(["a", "b"]);
  });

  it("throws when registering a duplicate id", () => {
    const registry = new ConnectorRegistry();
    registry.register(stubConnector("a"));
    expect(() => registry.register(stubConnector("a"))).toThrow(/already registered/);
  });

  it("unregister removes a connector", () => {
    const registry = new ConnectorRegistry();
    registry.register(stubConnector("a"));
    registry.unregister("a");
    expect(registry.get("a")).toBeUndefined();
    expect(registry.list()).toEqual([]);
  });

  it("get returns undefined for an unknown id", () => {
    const registry = new ConnectorRegistry();
    expect(registry.get("missing")).toBeUndefined();
  });
});
