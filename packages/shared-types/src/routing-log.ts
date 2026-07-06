import type { ScoreBreakdown } from "./scoring.js";

export interface RoutingLog {
  id: string;
  orderId: string;
  selectedVendorId: string | null;
  candidateScores: ScoreBreakdown[];
  decisionReason: string;
  executionResult: "success" | "failure" | "pending";
  createdAt: string;
}
