"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchForm({
  initialQuery = "",
  initialCountry = "",
  initialCategory = "",
}: {
  initialQuery?: string;
  initialCountry?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [category, setCategory] = useState(initialCategory);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (country) params.set("country", country);
    if (category) params.set("category", category);
    router.push(`/?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search vouchers (e.g. Amazon, Steam)"
        className="min-w-[220px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <input
        type="text"
        value={country}
        onChange={(event) => setCountry(event.target.value)}
        placeholder="Country"
        className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <input
        type="text"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        placeholder="Category"
        className="w-36 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Search
      </button>
    </form>
  );
}
