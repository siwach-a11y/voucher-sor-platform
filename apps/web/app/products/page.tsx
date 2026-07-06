"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProduct, getProductOffers } from "@/lib/api-client";
import { ScoreBreakdownTooltip } from "@/components/ScoreBreakdownTooltip";
import { BuyButton } from "@/components/BuyButton";
import { DEFAULT_SCORING_WEIGHTS } from "@/lib/types";
import type { OfferCandidate, Product } from "@/lib/types";

function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [offers, setOffers] = useState<OfferCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProduct(id), getProductOffers(id)])
      .then(([productResult, offersResult]) => {
        if (cancelled) return;
        setProduct(productResult);
        setOffers(offersResult);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load product");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p className="text-gray-500">Loading&hellip;</p>;

  const sorted = [...offers].sort((a, b) => b.finalScore - a.finalScore);
  const winner = sorted[0];

  return (
    <>
      <p className="text-sm text-gray-500">{product.brand}</p>
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="mb-6 text-xs text-gray-400">
        {product.country} &middot; {product.category}
      </p>

      <h2 className="mb-3 text-lg font-medium">Vendor comparison</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Est. delivery</th>
              <th className="px-4 py-2">Final score</th>
              <th className="px-4 py-2">Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((offer) => {
              const isWinner = offer.offerId === winner?.offerId;
              return (
                <tr
                  key={offer.offerId}
                  className={isWinner ? "bg-emerald-50" : "border-t border-gray-100"}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{offer.vendorName}</span>
                      {isWinner && (
                        <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          BEST
                        </span>
                      )}
                    </div>
                    <a
                      href={offer.vendorWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-400 hover:underline"
                    >
                      {offer.vendorWebsite}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {offer.price.toFixed(2)} {offer.currency}
                  </td>
                  <td className="px-4 py-3">
                    {offer.estimatedDeliveryMinutes != null
                      ? `${offer.estimatedDeliveryMinutes} min`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {(offer.finalScore * 100).toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBreakdownTooltip candidate={offer} weights={DEFAULT_SCORING_WEIGHTS} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <p className="mt-4 text-gray-500">No offers available for this product right now.</p>
      )}

      {winner && (
        <div className="mt-6">
          {/* Buying trusts the backend's live SOR routing decision at execution time —
              the frontend never sends a vendorId, only the product and the price the
              user saw for the top-ranked candidate. */}
          <BuyButton productId={product.id} sellingPrice={winner.price} currency={winner.currency} />
        </div>
      )}
    </>
  );
}

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) return <p className="text-red-600">No product id given.</p>;
  return <ProductDetail id={id} />;
}

export default function ProductDetailPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<p className="text-gray-500">Loading&hellip;</p>}>
        <ProductDetailContent />
      </Suspense>
    </main>
  );
}
