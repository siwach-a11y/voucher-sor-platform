"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchProducts } from "@/lib/api-client";
import { ProductCard } from "@/components/ProductCard";
import { SearchForm } from "@/components/SearchForm";
import type { Product } from "@/lib/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const country = searchParams.get("country") ?? "";
  const category = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    searchProducts({ query, country, category })
      .then((results) => {
        if (!cancelled) setProducts(results);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load products");
      });
    return () => {
      cancelled = true;
    };
  }, [query, country, category]);

  return (
    <>
      <SearchForm initialQuery={query} initialCountry={country} initialCategory={category} />
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {error ? (
          <p className="col-span-full text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="col-span-full text-gray-500">No products found.</p>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Find a voucher</h1>
      {/* useSearchParams needs a Suspense boundary so the static shell can prerender before hydration reads the query string. */}
      <Suspense fallback={<p className="text-gray-500">Loading&hellip;</p>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}
