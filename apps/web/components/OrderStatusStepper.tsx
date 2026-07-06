import type { OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = [
  "pending",
  "routing",
  "executing",
  "awaiting_user_approval",
  "paid",
  "extracting_voucher",
  "completed",
];

const LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  routing: "Routing",
  executing: "Executing",
  awaiting_user_approval: "Awaiting approval",
  paid: "Paid",
  extracting_voucher: "Extracting voucher",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const isTerminalFailure = status === "failed" || status === "cancelled";
  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STEPS.map((step, index) => {
        const isActive = !isTerminalFailure && index === currentIndex;
        const isDone = !isTerminalFailure && currentIndex >= 0 && index < currentIndex;

        return (
          <div key={step} className="flex items-center gap-2">
            <span
              className={
                isActive
                  ? "rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                  : isDone
                    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                    : "rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-400"
              }
            >
              {LABELS[step]}
            </span>
            {index < STEPS.length - 1 && <span className="text-gray-300">&rarr;</span>}
          </div>
        );
      })}
      {isTerminalFailure && (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          {LABELS[status]}
        </span>
      )}
    </div>
  );
}
