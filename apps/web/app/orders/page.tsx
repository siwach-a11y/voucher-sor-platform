"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listOrders } from "@/lib/api-client";
import { DEMO_USER_ID } from "@/lib/constants";
import type { Order } from "@/lib/types";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listOrders(DEMO_USER_ID)
      .then((result) => {
        if (!cancelled) setOrders(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load orders");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Order history</h1>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/track?id=${encodeURIComponent(order.id)}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.productId}</td>
                  <td className="px-4 py-3">{order.vendorId ?? "—"}</td>
                  <td className="px-4 py-3">
                    {order.sellingPrice.toFixed(2)} {order.currency}
                  </td>
                  <td className="px-4 py-3 capitalize">{order.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
