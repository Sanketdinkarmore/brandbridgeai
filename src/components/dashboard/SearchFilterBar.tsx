"use client";

import { Search } from "lucide-react";

interface SearchFilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
}

export default function SearchFilterBar({
  query,
  onQueryChange,
  placeholder = "Search...",
  filters,
}: SearchFilterBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="bb-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
        />
      </div>
      {filters && <div className="flex flex-wrap gap-2">{filters}</div>}
    </div>
  );
}
