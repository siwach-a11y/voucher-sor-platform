import type { VendorAgentFactory } from "@voucher-sor/vendor-agents";
import { PlaceholderVendorAgent } from "./placeholder-agent.js";

/** Matches the vendor ids seeded in packages/db/src/seed.ts. Adding a real vendor later is a
 * one-line change: swap its entry to import a concrete VendorAgentFactory from vendor-agents. */
const SEEDED_VENDOR_IDS = ["vendor_a", "vendor_b", "vendor_c"] as const;

export const agentFactories: Record<string, VendorAgentFactory> = Object.fromEntries(
  SEEDED_VENDOR_IDS.map((vendorId): [string, VendorAgentFactory] => [
    vendorId,
    (context, page) => new PlaceholderVendorAgent(vendorId, context, page),
  ]),
);
