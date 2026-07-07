import type { VendorAgentFactory } from "@voucher-sor/vendor-agents";

/**
 * No vendor agents are registered by default — this project ships as a vendor-agnostic framework
 * and must compile and run without depending on any real (or fictional) vendor. Register a real
 * vendor's automation module here by adding its id and a factory that builds a concrete
 * BaseVendorAgent subclass (see packages/vendor-agents/src/agents/generic-vendor-agent.ts for a
 * configurable starting point, or extend BaseVendorAgent directly):
 *
 *   export const agentFactories: Record<string, VendorAgentFactory> = {
 *     "my-real-vendor": (context, page) => new MyVendorAgent(context, page),
 *   };
 */
export const agentFactories: Record<string, VendorAgentFactory> = {};
