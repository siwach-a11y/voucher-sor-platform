"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder } from "@/lib/api-client";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { VoucherCard } from "@/components/VoucherCard";
import type { Order } from "@/lib/types";

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

function OrderTracker({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    async function poll() {
      try {
        const data = await getOrder(id);
        if (cancelled) return;
        setOrder(data);
        if (TERMINAL_STATUSES.has(data.status) && interval) {
          clearInterval(interval);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load order");
      }
    }

    // Order execution is a short-lived, low-frequency browser-automation run — a 2s poll
    // gives responsive-feeling updates without the infra cost of SSE/websockets.
    void poll();
    interval = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return <p className="text-gray-500">Loading order&hellip;</p>;

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Order {order.id}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Placed {new Date(order.createdAt).toLocaleString()}
      </p>

      <OrderStatusStepper status={order.status} />

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-gray-500">Selling price</dt>
          <dd>
            {order.sellingPrice.toFixed(2)} {order.currency}
          </dd>
        </div>
        {order.purchasePrice != null && (
          <div>
            <dt className="text-gray-500">Purchase price</dt>
            <dd>
              {order.purchasePrice.toFixed(2)} {order.currency}
            </dd>
          </div>
        )}
      </dl>

      {order.status === "failed" && order.failureReason && (
        <p className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700">{order.failureReason}</p>
      )}

      {order.status === "completed" && order.voucher && (
        <div className="mt-8">
          <VoucherCard voucher={order.voucher} />
        </div>
      )}
    </>
  );
}

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <p className="text-red-600">No order id given.</p>;
  return <OrderTracker id={id} />;
}

export default function OrderTrackingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Suspense fallback={<p className="text-gray-500">Loading&hellip;</p>}>
        <OrderTrackerContent />
      </Suspense>
    </main>
  );
}
