"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { ProductMeta, ProductOwnerStatus } from "../lib/types";

export interface SearchFilterState {
  q: string;
  category: string;
  status: ProductOwnerStatus | "";
  tags: string;
  minBudget: string;
  maxBudget: string;
}

interface ProductSearchFiltersProps {
  filters: SearchFilterState;
  meta: ProductMeta;
  onChange: (filters: SearchFilterState) => void;
  resultCount?: number;
}

export default function ProductSearchFilters({
  filters,
  meta,
  onChange,
  resultCount,
}: ProductSearchFiltersProps) {
  function update(partial: Partial<SearchFilterState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="bb-glass mb-6 space-y-4 rounded-2xl p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            className="bb-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm"
            placeholder="Search products by name, description, category..."
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        {resultCount != null && (
          <span className="shrink-0 text-xs text-white/45">
            {resultCount} product{resultCount !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-white/45">
        <SlidersHorizontal size={14} />
        Advanced filters
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          className="bb-input rounded-xl px-3 py-2 text-sm"
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {meta.categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="bb-input rounded-xl px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => update({ status: e.target.value as ProductOwnerStatus | "" })}
        >
          <option value="">All statuses</option>
          {meta.statuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          className="bb-input rounded-xl px-3 py-2 text-sm"
          value={filters.tags}
          onChange={(e) => update({ tags: e.target.value })}
        >
          <option value="">All tags</option>
          {meta.tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        <input
          className="bb-input rounded-xl px-3 py-2 text-sm"
          placeholder="Min budget"
          type="number"
          min="0"
          value={filters.minBudget}
          onChange={(e) => update({ minBudget: e.target.value })}
        />

        <input
          className="bb-input rounded-xl px-3 py-2 text-sm"
          placeholder="Max budget"
          type="number"
          min="0"
          value={filters.maxBudget}
          onChange={(e) => update({ maxBudget: e.target.value })}
        />
      </div>
    </div>
  );
}

export const emptyFilters: SearchFilterState = {
  q: "",
  category: "",
  status: "",
  tags: "",
  minBudget: "",
  maxBudget: "",
};
