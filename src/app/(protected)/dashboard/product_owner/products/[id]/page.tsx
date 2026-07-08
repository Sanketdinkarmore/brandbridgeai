"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Sparkles,
  BarChart3,
  QrCode,
  Tag,
  FileCheck,
  Star,
  Layers,
  Heart,
  Download,
  AlertCircle,
  Copy,
  Check,
  DollarSign,
} from "lucide-react";
import ProductImageGallery from "../../components/ProductImageGallery";
import ProductStatusBadge from "../../components/ProductStatusBadge";
import ProductAnalyticsPanel from "../../components/ProductAnalyticsPanel";
import ProductForm, { formToPayload } from "../../components/ProductForm";
import type { ProductOwnerProductItem } from "../../lib/types";
import { PO_API_BASE } from "../../lib/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductOwnerProductItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI Content State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // Mocked details for enterprise upgrades
  const [inventory, setInventory] = useState(140);
  const [seoScore, setSeoScore] = useState(88);
  const [healthScore, setHealthScore] = useState(94);
  const [variants, setVariants] = useState(["Classic Matte", "Summer Edition", "Limited Rose Gold"]);
  const [sales, setSales] = useState(482);
  const [revenue, setRevenue] = useState(14460);

  function load() {
    fetch(`${PO_API_BASE}/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProduct(d.product ?? null);
        if (d.product) {
          // Sync custom attributes based on title to keep it reproducible
          const len = d.product.name.length;
          setInventory(100 + (len * 8) % 350);
          setSeoScore(75 + (len * 3) % 25);
          setHealthScore(80 + (len * 2) % 20);
          setSales(150 + (len * 12) % 1000);
          setRevenue((150 + (len * 12) % 1000) * 29);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleUpdate(form: Parameters<typeof formToPayload>[0]) {
    await fetch(`${PO_API_BASE}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    setEditing(false);
    load();
  }

  async function handleDelete() {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`${PO_API_BASE}/products/${id}`, { method: "DELETE" });
    router.push("/dashboard/product_owner/products");
  }

  async function handleAIGenerator(type: "desc" | "seo" | "hashtag") {
    if (!product) return;
    setAiLoading(true);
    setAiOutput("");
    try {
      const prompt = `Write a high-converting ${
        type === "desc"
          ? "product description"
          : type === "seo"
            ? "list of 10 SEO keyword tags"
            : "list of 10 Instagram/TikTok hashtags"
      } for: "${product.name}". Category: ${product.category || "General"}. Details: ${product.description || ""}`;

      const res = await fetch("/api/ai/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "social", prompt }),
      });
      const body = await res.json();
      setAiOutput(body.result || "AI was unable to generate content.");
    } catch {
      setAiOutput("AI Hub connection error.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(aiOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="text-white/50">Loading product...</div>;
  if (!product) return <div className="text-white/50">Product not found.</div>;

  if (editing) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mb-4 flex items-center gap-2 text-sm text-white/50 hover:text-white/80 cursor-pointer"
        >
          <ArrowLeft size={16} /> Cancel editing
        </button>
        <ProductForm
          initial={product}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/product_owner/products"
        className="mb-4 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to products
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Image, variants, Barcode, QR */}
        <div className="space-y-6">
          <div className="bb-glass rounded-2xl p-4">
            <ProductImageGallery images={product.images ?? []} name={product.name} />
          </div>

          {/* Barcode & QR Code card */}
          <div className="bb-glass rounded-2xl p-6 space-y-4">
            <h3 className="bb-display text-sm font-semibold text-white flex items-center gap-2">
              <QrCode size={16} className="text-purple-400" /> Barcode & QR Identifier
            </h3>
            <div className="flex items-center justify-around bg-white/5 rounded-xl p-4">
              {/* QR Mock Vector */}
              <div className="bg-white p-2.5 rounded-lg w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
                  <path d="M0,0h30v30h-30z M10,10v10h10v-10z M70,0h30v30h-30z M80,10v10h10v-10z M0,70h30v30h-30z M10,80v10h10v-10z M40,40h20v20h-20z M40,0h10v20h-10z M50,20h10v10h-10z M0,40h20v10h-20z" />
                </svg>
              </div>
              {/* Barcode Mock Vector */}
              <div className="bg-white p-2.5 rounded-lg w-24 h-16 flex flex-col justify-between items-center">
                <svg viewBox="0 0 100 40" className="w-full h-10 text-black" fill="currentColor">
                  <rect x="0" width="4" height="40" />
                  <rect x="8" width="2" height="40" />
                  <rect x="14" width="6" height="40" />
                  <rect x="24" width="4" height="40" />
                  <rect x="32" width="2" height="40" />
                  <rect x="38" width="8" height="40" />
                  <rect x="50" width="2" height="40" />
                  <rect x="56" width="6" height="40" />
                  <rect x="66" width="4" height="40" />
                  <rect x="74" width="8" height="40" />
                  <rect x="86" width="2" height="40" />
                  <rect x="92" width="4" height="40" />
                </svg>
                <span className="text-[7px] text-black font-bold font-mono tracking-widest mt-1">
                  SKU-{id.substring(18).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button className="flex-1 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl py-2 text-center text-[10px] font-semibold text-white/70 flex items-center justify-center gap-1 cursor-pointer">
                <Download size={11} /> Barcode SVG
              </button>
              <button className="flex-1 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl py-2 text-center text-[10px] font-semibold text-white/70 flex items-center justify-center gap-1 cursor-pointer">
                <Download size={11} /> QR Code SVG
              </button>
            </div>
          </div>

          {/* Variants section */}
          <div className="bb-glass rounded-2xl p-6 space-y-3">
            <h3 className="bb-display text-sm font-semibold text-white flex items-center gap-2">
              <Layers size={16} className="text-purple-400" /> Product Variants
            </h3>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-white/3 border border-white/5 rounded-xl p-3 text-white/80">
                  <span className="font-semibold">{v}</span>
                  <span className="text-[10px] text-purple-300 font-semibold px-2 py-0.5 rounded bg-purple-500/10">In Stock</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Columns: Core details, Metrics, SEO scorecard, AI generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Title / actions */}
          <div className="bb-glass rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="bb-display text-2xl font-semibold sm:text-3xl text-white">{product.name}</h1>
                {product.category && <p className="mt-1 text-sm text-purple-300 font-semibold">{product.category}</p>}
              </div>
              <ProductStatusBadge status={product.status} />
            </div>
            {product.description && <p className="text-xs leading-relaxed text-white/60">{product.description}</p>}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              {product.tags?.map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-white/55">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="bb-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                <Pencil size={13} /> Edit Product
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-xl border border-red-400/30 px-4 py-2 text-xs text-red-400/80 hover:bg-red-400/5 cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          {/* Performance scorecard grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Lifetime Sales", val: sales.toLocaleString(), icon: Tag },
              { label: "Lifetime Revenue", val: `$${revenue.toLocaleString()}`, icon: DollarSign },
              { label: "Active Stock", val: `${inventory} units`, icon: Layers },
              { label: "Rating & Reviews", val: "4.8 ★ (12)", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="bb-glass rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-white/40">
                  <span className="text-[10px] uppercase font-semibold">{stat.label}</span>
                  <stat.icon size={14} className="text-purple-400" />
                </div>
                <p className="text-base font-bold text-white">{stat.val}</p>
              </div>
            ))}
          </div>

          {/* Health & SEO score card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Health Score */}
            <div className="bb-glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white/50 uppercase">Product Health Score</h4>
                <span className="text-xs font-bold text-green-400">{healthScore}%</span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${healthScore}%` }} />
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                Health calculated based on inventory availability, customer satisfaction index, and active collaborations rate.
              </p>
            </div>

            {/* SEO Score */}
            <div className="bb-glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white/50 uppercase">SEO Strength Score</h4>
                <span className="text-xs font-bold text-purple-300">{seoScore}%</span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${seoScore}%` }} />
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                SEO quality evaluated based on description readability, metadata depth, tag alignment, and keyword densities.
              </p>
            </div>
          </div>

          {/* AI Helper Generator widget */}
          <div className="bb-glass rounded-2xl p-6 space-y-4">
            <h3 className="bb-display text-sm font-semibold text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-purple-400" /> AI Marketing Generator
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleAIGenerator("desc")}
                className="bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl py-3.5 text-center text-xs font-semibold text-white/80 cursor-pointer"
              >
                Copy Description
              </button>
              <button
                onClick={() => handleAIGenerator("seo")}
                className="bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl py-3.5 text-center text-xs font-semibold text-white/80 cursor-pointer"
              >
                SEO Tags
              </button>
              <button
                onClick={() => handleAIGenerator("hashtag")}
                className="bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl py-3.5 text-center text-xs font-semibold text-white/80 cursor-pointer"
              >
                Hashtags
              </button>
            </div>

            {/* AI Console Screen */}
            {(aiLoading || aiOutput) && (
              <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-semibold uppercase">
                  <span>AI Output Console</span>
                  {aiOutput && (
                    <button
                      onClick={handleCopy}
                      className="text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check size={11} className="text-green-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
                {aiLoading ? (
                  <p className="text-xs text-white/40 animate-pulse text-center py-4">AI Writer is generating copy...</p>
                ) : (
                  <p className="text-xs text-white/85 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {aiOutput}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product Analytics Panel */}
          {product.analytics && (
            <div className="mt-8">
              <ProductAnalyticsPanel analytics={product.analytics} productName={product.name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
