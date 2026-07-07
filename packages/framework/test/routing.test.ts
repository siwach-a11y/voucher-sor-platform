import { describe, expect, it } from "vitest";
import { ConnectorRegistry } from "../src/connectors/registry.js";
import type { VendorConnector } from "../src/connectors/base/connector.interface.js";
import { ScoringService } from "../src/core/scoring/scoring.service.js";
import { ExecutionEngine } from "../src/core/execution/execution.engine.js";
import { EventBus } from "../src/core/events/event-bus.js";
import { RoutingEngine } from "../src/core/routing/routing.engine.js";
import { emptyConnectorHealth } from "../src/domain/routing/connector-health.js";
import type { SearchResult } from "../src/domain/execution/search.js";

function fakeConnector(id: string, price: number, options: { checkoutAvailable?: boolean; buySucceeds?: boolean } = {}): VendorConnector {
  const { checkoutAvailable = true, buySucceeds = true } = options;
  const offer: SearchResult = {
    connectorId: id,
    externalId: `${id}-item`,
    price,
    currency: "USD",
    inStock: true,
    checkoutAvailable,
    scrapedAt: new Date(0).toISOString(),
  };
  return {
    id,
    name: `Connector ${id}`,
    search: async () => [offer],
    buy: async (request) => ({
      orderId: request.orderId,
      connectorId: id,
      success: buySucceeds,
      purchasePrice: buySucceeds ? request.expectedPrice : null,
      confirmationCode: buySucceeds ? "confirmation-123" : null,
      executionTimeMs: 10,
      failureReason: buySucceeds ? null : "stub failure",
      requiresUserApproval: false,
    }),
    verify: async () => ({ verified: true }),
  };
}

function makeRoutingEngine(healthProvider = emptyConnectorHealth) {
  const registry = new ConnectorRegistry();
  const scoring = new ScoringService();
  const eventBus = new EventBus();
  const execution = new ExecutionEngine(eventBus, { maxAttempts: 1 });
  const routing = new RoutingEngine(registry, scoring, execution, eventBus, healthProvider);
  return { registry, routing, eventBus };
}

describe("RoutingEngine.route", () => {
  it("selects the cheapest available connector and completes a purchase", async () => {
    const { registry, routing } = makeRoutingEngine();
    registry.register(fakeConnector("expensive", 100));
    registry.register(fakeConnector("cheap", 50));

    const outcome = await routing.route({ orderId: "order_1", product: { id: "product_1", name: "Test Product" } });

    expect(outcome.decision.selectedConnectorId).toBe("cheap");
    expect(outcome.result?.success).toBe(true);
    expect(outcome.result?.purchasePrice).toBe(50);
  });

  it("skips a connector whose offer has checkout unavailable", async () => {
    const { registry, routing } = makeRoutingEngine();
    registry.register(fakeConnector("unavailable", 10, { checkoutAvailable: false }));
    registry.register(fakeConnector("available", 20));

    const outcome = await routing.route({ orderId: "order_2", product: { id: "product_1", name: "Test Product" } });

    expect(outcome.decision.selectedConnectorId).toBe("available");
  });

  it("returns a null result and a clear reason when no connector has an available offer", async () => {
    const { registry, routing } = makeRoutingEngine();
    registry.register(fakeConnector("unavailable", 10, { checkoutAvailable: false }));

    const outcome = await routing.route({ orderId: "order_3", product: { id: "product_1", name: "Test Product" } });

    expect(outcome.decision.selectedConnectorId).toBeNull();
    expect(outcome.result).toBeNull();
    expect(outcome.decision.reason).toMatch(/no eligible connector/i);
  });

  it("reports failure when the chosen connector's buy() fails", async () => {
    const { registry, routing } = makeRoutingEngine();
    registry.register(fakeConnector("failing", 10, { buySucceeds: false }));

    const outcome = await routing.route({ orderId: "order_4", product: { id: "product_1", name: "Test Product" } });

    expect(outcome.decision.selectedConnectorId).toBe("failing");
    expect(outcome.result?.success).toBe(false);
    expect(outcome.result?.failureReason).toBe("stub failure");
  });

  it("prefers a connector with better health when prices are equal", async () => {
    const { registry, routing } = makeRoutingEngine((connectorId) => ({
      ...emptyConnectorHealth(connectorId),
      successfulOrders: connectorId === "reliable" ? 100 : 0,
      totalOrders: connectorId === "reliable" ? 100 : 100,
    }));
    registry.register(fakeConnector("reliable", 30));
    registry.register(fakeConnector("unproven", 30));

    const outcome = await routing.route({ orderId: "order_5", product: { id: "product_1", name: "Test Product" } });

    expect(outcome.decision.selectedConnectorId).toBe("reliable");
  });
});
