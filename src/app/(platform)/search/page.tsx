
"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">
        Search
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Search for people and content on Africa CEOs.
      </p>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search..."
        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

      {query.trim() !== "" && (
        <p className="mt-4 text-sm text-gray-500">
          Your search: {query}
        </p>
      )}
    </main>
  );
}
