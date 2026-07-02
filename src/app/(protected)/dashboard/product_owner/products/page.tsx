"use client";

import { useState, useEffect } from "react";
import { Package, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import ProductCard from "@/components/dashboard/ProductCard";
import EmptyState from "@/components/dashboard/EmptyState";

import type { ProductItem } from "@/lib/dashboard-types";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "", targetAudience: "" });
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", description: "", category: "", targetAudience: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  async function handleMatch(productId: string) {
    const res = await fetch("/api/ai/product-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (data.matches?.length) {
      alert(`Top match: ${data.matches[0].companyName} (${data.matches[0].compatibilityScore}% compatible)`);
    } else {
      alert("No brand matches found. Try again later.");
    }
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="My Products" subtitle="Manage products for brand promotion" action={
        <button onClick={() => setShowForm(!showForm)} className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
          <Plus size={16} /> Add Product
        </button>
      } />
      {showForm && (
        <form onSubmit={handleCreate} className="bb-glass mb-6 rounded-2xl p-6 space-y-4">
          <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Target audience" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
          <button type="submit" className="bb-btn-primary rounded-xl px-4 py-2 text-sm">Save Product</button>
        </form>
      )}
      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products listed" description="Add your first product to start finding brand partners." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p._id} name={p.name} description={p.description} category={p.category} image={p.images?.[0]} status={p.status} onDelete={() => handleDelete(p._id)} onMatch={() => handleMatch(p._id)} />
          ))}
        </div>
      )}
    </div>
  );
}
