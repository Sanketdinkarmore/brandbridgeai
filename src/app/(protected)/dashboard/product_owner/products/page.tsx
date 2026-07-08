"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import ProductOwnerProductCard from "../components/ProductOwnerProductCard";
import ProductForm, { formToPayload } from "../components/ProductForm";
import ProductSearchFilters, {
  emptyFilters,
  type SearchFilterState,
} from "../components/ProductSearchFilters";
import type { ProductMeta, ProductOwnerProductItem } from "../lib/types";
import { PO_API_BASE } from "../lib/types";

function buildSearchUrl(filters: SearchFilterState) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  if (filters.tags) params.set("tags", filters.tags);
  if (filters.minBudget) params.set("minBudget", filters.minBudget);
  if (filters.maxBudget) params.set("maxBudget", filters.maxBudget);
  const qs = params.toString();
  return `${PO_API_BASE}/products/search${qs ? `?${qs}` : ""}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductOwnerProductItem[]>([]);
  const [meta, setMeta] = useState<ProductMeta>({
    categories: [],
    tags: [],
    statuses: ["draft", "active", "archived"],
  });
  const [filters, setFilters] = useState<SearchFilterState>(emptyFilters);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductOwnerProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(buildSearchUrl(filters)).then((r) => r.json()),
      fetch(`${PO_API_BASE}/meta`).then((r) => r.json()),
    ])
      .then(([searchData, metaData]) => {
        setProducts(searchData.products ?? []);
        if (metaData.categories) {
          setMeta({
            categories: metaData.categories,
            tags: metaData.tags,
            statuses: metaData.statuses,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleCreate(form: Parameters<typeof formToPayload>[0]) {
    await fetch(`${PO_API_BASE}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setShowForm(false);
    load();
  }

  async function handleUpdate(form: Parameters<typeof formToPayload>[0]) {
    if (!editingProduct) return;
    await fetch(`${PO_API_BASE}/products/${editingProduct._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setEditingProduct(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`${PO_API_BASE}/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="My Products"
        subtitle="Manage products with images, status, tags, and collaboration goals"
        action={
          !showForm && !editingProduct ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
            >
              <Plus size={16} /> Add Product
            </button>
          ) : undefined
        }
      />

      <ProductSearchFilters
        filters={filters}
        meta={meta}
        onChange={setFilters}
        resultCount={products.length}
      />

      {showForm && (
        <div className="mb-6">
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            submitLabel="Create Product"
          />
        </div>
      )}

      {editingProduct && (
        <div className="mb-6">
          <ProductForm
            initial={editingProduct}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
            submitLabel="Update Product"
          />
        </div>
      )}

      {loading ? (
        <div className="text-white/50">Loading products...</div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Add your first product or adjust your search filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductOwnerProductCard
              key={p._id}
              product={p}
              onEdit={() => {
                setShowForm(false);
                setEditingProduct(p);
              }}
              onDelete={() => handleDelete(p._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
