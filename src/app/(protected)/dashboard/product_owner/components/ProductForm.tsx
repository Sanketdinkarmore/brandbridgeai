"use client";

import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import type { ProductOwnerProductItem, ProductOwnerStatus } from "../lib/types";

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  tags: string;
  targetAudience: string;
  status: ProductOwnerStatus;
  collaborationGoals: string;
  marketingBudget: string;
  images: string[];
}

interface ProductFormProps {
  initial?: Partial<ProductOwnerProductItem>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  category: "",
  tags: "",
  targetAudience: "",
  status: "draft",
  collaborationGoals: "",
  marketingBudget: "",
  images: [],
};

export default function ProductForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(() => ({
    ...emptyForm,
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    tags: initial?.tags?.join(", ") ?? "",
    targetAudience: initial?.targetAudience ?? "",
    status: initial?.status ?? "draft",
    collaborationGoals: initial?.collaborationGoals ?? "",
    marketingBudget:
      initial?.marketingBudget != null ? String(initial.marketingBudget) : "",
    images: initial?.images ?? [],
  }));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) urls.push(data.url);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bb-glass space-y-4 rounded-2xl p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm md:col-span-2"
          placeholder="Product name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm md:col-span-2"
          placeholder="Description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          placeholder="Tags (comma-separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <input
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          placeholder="Target audience"
          value={form.targetAudience}
          onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
        />
        <select
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as ProductOwnerStatus })}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <input
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          placeholder="Marketing budget ($)"
          type="number"
          min="0"
          value={form.marketingBudget}
          onChange={(e) => setForm({ ...form, marketingBudget: e.target.value })}
        />
        <textarea
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm md:col-span-2"
          placeholder="Collaboration goals"
          rows={2}
          value={form.collaborationGoals}
          onChange={(e) => setForm({ ...form, collaborationGoals: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-white/50">Product images</label>
        <div className="flex flex-wrap gap-3">
          {form.images.map((img, i) => (
            <div key={img + i} className="relative h-20 w-20 overflow-hidden rounded-xl">
              <img src={img} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white/80"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 text-white/40 hover:border-purple-400/50 hover:text-purple-300">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="mt-1 text-[10px]">Upload</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="bb-btn-primary rounded-xl px-4 py-2 text-sm">
          {saving ? "Saving..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function formToPayload(form: ProductFormData) {
  return {
    name: form.name,
    description: form.description || undefined,
    category: form.category || undefined,
    tags: form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    targetAudience: form.targetAudience || undefined,
    status: form.status,
    collaborationGoals: form.collaborationGoals || undefined,
    marketingBudget: form.marketingBudget ? Number(form.marketingBudget) : undefined,
    images: form.images,
  };
}
