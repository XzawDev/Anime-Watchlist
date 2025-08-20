// components/SearchBar.tsx
"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-400 transition-colors" />

        <input
          type="text"
          placeholder="Search anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full bg-black/40 border border-white/10 py-3 pl-12 pr-28 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none backdrop-blur-md shadow-inner transition"
        />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-fuchsia-500/30 transition-transform hover:scale-105"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
