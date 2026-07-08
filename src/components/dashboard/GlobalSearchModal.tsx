"use client";

import { X, Search, Package, Megaphone, User, Folder, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PO_API_BASE } from "@/app/(protected)/dashboard/product_owner/lib/types";

interface SearchResultItem {
  id: string;
  title: string;
  type: "product" | "brand" | "campaign" | "document";
  url: string;
  subtitle?: string;
}

interface GlobalSearchModalProps {
  onClose: () => void;
}

export default function GlobalSearchModal({ onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keyboard listener to close on Esc
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      // Parallel searches across products, brands, campaigns, documents
      Promise.all([
        fetch(`${PO_API_BASE}/products?q=${query}`).then((r) => r.json()),
        fetch(`/api/brands?q=${query}`).then((r) => r.json()),
        fetch("/api/campaigns").then((r) => r.json()),
        fetch("/api/documents").then((r) => r.json()),
      ])
        .then(([prodData, brandData, campData, docData]) => {
          const list: SearchResultItem[] = [];

          // Products
          (prodData.products ?? []).slice(0, 3).forEach((p: any) => {
            list.push({
              id: p._id,
              title: p.name,
              type: "product",
              url: `/dashboard/product_owner/products/${p._id}`,
              subtitle: p.category,
            });
          });

          // Brands
          (brandData.brands ?? []).slice(0, 3).forEach((b: any) => {
            list.push({
              id: b.profile.userId,
              title: b.profile.companyName,
              type: "brand",
              url: `/dashboard/product_owner/brands`,
              subtitle: b.profile.industry,
            });
          });

          // Campaigns
          (campData.campaigns ?? [])
            .filter((c: any) => c.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .forEach((c: any) => {
              list.push({
                id: c._id,
                title: c.title,
                type: "campaign",
                url: `/dashboard/product_owner/campaigns`,
                subtitle: c.status,
              });
            });

          // Documents
          (docData.documents ?? [])
            .filter((d: any) => d.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .forEach((d: any) => {
              list.push({
                id: d._id,
                title: d.title,
                type: "document",
                url: `/dashboard/product_owner`,
                subtitle: d.fileName,
              });
            });

          setResults(list);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  function handleSelect(url: string) {
    router.push(url);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/65 p-4 pt-[10vh] backdrop-blur-sm">
      <div className="bb-glass w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[60vh]">
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 bg-white/2">
          <Search size={18} className="text-purple-400 shrink-0" />
          <input
            className="bg-transparent text-sm text-white placeholder-white/40 outline-none border-none flex-1 py-1"
            placeholder="Global search products, brands, campaigns, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer p-1">
            <X size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <p className="text-xs text-white/40 animate-pulse py-6 text-center">Searching database...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-white/35 py-6 text-center">
              {query ? "No matches found." : "Type above to search globally."}
            </p>
          ) : (
            <div className="space-y-1.5">
              {results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.url)}
                  className="w-full text-left rounded-xl bg-white/3 hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/20 p-3.5 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded bg-white/5 p-1.5 text-white/50 group-hover:text-purple-300">
                      {res.type === "product" ? (
                        <Package size={14} />
                      ) : res.type === "campaign" ? (
                        <Megaphone size={14} />
                      ) : res.type === "brand" ? (
                        <User size={14} />
                      ) : (
                        <Folder size={14} />
                      )}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white/90 group-hover:text-purple-200">{res.title}</h4>
                      {res.subtitle && <span className="text-[10px] text-white/40 mt-0.5 block">{res.subtitle}</span>}
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-white/20 group-hover:text-purple-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
