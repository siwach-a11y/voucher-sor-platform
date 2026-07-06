"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "@/lib/api-client";
import { DEMO_USER_ID } from "@/lib/constants";

export function BuyButton({
  productId,
  sellingPrice,
  currency,
}: {
  productId: string;
  sellingPrice: number;
  currency: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({ userId: DEMO_USER_ID, productId, sellingPrice });
      router.push(`/orders/track?id=${encodeURIComponent(order.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleBuy}
        disabled={isSubmitting}
        className="rounded-md bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Placing order..." : `Buy for ${sellingPrice.toFixed(2)} ${currency}`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
