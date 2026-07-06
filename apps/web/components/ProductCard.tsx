import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products?id=${encodeURIComponent(product.id)}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-400 hover:shadow-sm"
    >
      <p className="text-sm text-gray-500">{product.brand}</p>
      <h2 className="font-medium text-gray-900">{product.name}</h2>
      <p className="mt-2 text-xs text-gray-400">
        {product.country} &middot; {product.category}
      </p>
    </Link>
  );
}
