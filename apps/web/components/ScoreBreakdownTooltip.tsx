import type { OfferCandidate, ScoringWeights } from "@/lib/types";

export function ScoreBreakdownTooltip({
  candidate,
  weights,
}: {
  candidate: OfferCandidate;
  weights: ScoringWeights;
}) {
  const rows = [
    { label: "Price", value: candidate.priceScore, weight: weights.price },
    { label: "Success rate", value: candidate.successScore, weight: weights.successRate },
    { label: "Checkout speed", value: candidate.speedScore, weight: weights.checkoutSpeed },
    { label: "Stock confidence", value: candidate.stockConfidence, weight: weights.stockConfidence },
    { label: "Reliability", value: candidate.reliabilityScore, weight: weights.reliability },
    { label: "Risk penalty (subtracted)", value: candidate.riskPenalty, weight: weights.risk },
  ];

  return (
    <details>
      <summary className="cursor-pointer text-xs font-medium text-indigo-600 hover:underline">
        View breakdown
      </summary>
      <div className="relative">
        <div className="absolute z-10 mt-2 w-64 rounded-md border border-gray-200 bg-white p-3 text-xs shadow-lg">
          <ul className="space-y-1">
            {rows.map((row) => (
              <li key={row.label} className="flex justify-between gap-2">
                <span className="text-gray-500">
                  {row.label} (w={Math.round(row.weight * 100)}%)
                </span>
                <span className="font-medium text-gray-900">{row.value.toFixed(2)}</span>
              </li>
            ))}
            <li className="mt-1 flex justify-between border-t border-gray-100 pt-1 font-semibold text-gray-900">
              <span>Final score</span>
              <span>{candidate.finalScore.toFixed(3)}</span>
            </li>
          </ul>
        </div>
      </div>
    </details>
  );
}
