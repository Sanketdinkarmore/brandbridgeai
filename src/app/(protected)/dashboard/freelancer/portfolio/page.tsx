"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Plus, Upload } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

import type { PortfolioItemData } from "@/lib/dashboard-types";

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItemData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", mediaUrl: "", category: "" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/portfolio").then((r) => r.json()).then((d) => setItems(d.items ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setForm((f) => ({ ...f, mediaUrl: data.url }));
    setUploading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", description: "", mediaUrl: "", category: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="My Portfolio" subtitle="Showcase your best work" action={
        <button onClick={() => setShowForm(!showForm)} className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Plus size={16} /> Add Work</button>
      } />
      {showForm && (
        <form onSubmit={handleCreate} className="bb-glass mb-6 rounded-2xl p-6 space-y-4">
          <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 hover:bg-white/5">
            <Upload size={14} /> {uploading ? "Uploading..." : "Upload Media"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
          {form.mediaUrl && <img src={form.mediaUrl} alt="Preview" className="h-32 rounded-xl object-cover" />}
          <button type="submit" disabled={!form.mediaUrl} className="bb-btn-primary rounded-xl px-4 py-2 text-sm">Save</button>
        </form>
      )}
      {items.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Portfolio is empty" description="Upload your best work to attract brand collaborations." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="bb-glass overflow-hidden rounded-2xl">
              <div className="aspect-video"><img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" /></div>
              <div className="p-4">
                <h3 className="bb-display font-medium">{item.title}</h3>
                {item.category && <p className="text-xs text-purple-300">{item.category}</p>}
                {item.description && <p className="mt-1 text-xs text-white/45">{item.description}</p>}
                <button onClick={() => handleDelete(item._id)} className="mt-3 text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
