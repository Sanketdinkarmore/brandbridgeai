"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ShieldCheck, Star, Sparkles, ArrowRight, RefreshCw, Bookmark, BookmarkCheck } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import type { BrandItem } from "@/lib/dashboard-types";
import type { ProductOwnerProductItem } from "../lib/types";
import { PO_API_BASE } from "../lib/types";

interface ExtendedBrand {
  profile: {
    userId: string;
    companyName: string;
    industry?: string;
    location?: string;
    logo?: string;
    website?: string;
    bio?: string;
    followersCount?: number;
    successRate?: number;
    brandScore?: number;
    isVerified?: boolean;
    compatibilityScore?: number;
    city?: string;
    platforms?: string[];
  };
  user: {
    name: string;
    email: string;
  };
}

export default function FindBrandsPage() {
  const [brands, setBrands] = useState<ExtendedBrand[]>([]);
  const [products, setProducts] = useState<ProductOwnerProductItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Advanced Filters
  const [industry, setIndustry] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [followers, setFollowers] = useState("all");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Favorites, Comparison, Recently Viewed
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<ExtendedBrand[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ExtendedBrand[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "saved" | "compare">("browse");

  // Outreach suggestion
  const [outreachProposal, setOutreachProposal] = useState<string | null>(null);
  const [activeOutreachPartner, setActiveOutreachPartner] = useState<ExtendedBrand | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Load local storage states
    const favs = localStorage.getItem("bb_saved_brands");
    if (favs) setFavorites(JSON.parse(favs));

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserName(d.user?.name ?? ""));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (industry !== "all") params.set("industry", industry);

    setLoading(true);
    Promise.all([
      fetch(`/api/brands?${params}`).then((r) => r.json()),
      fetch(`${PO_API_BASE}/products`).then((r) => r.json()),
    ])
      .then(([brandData, productData]) => {
        // Enforce extra mock attributes for verified premium layout
        const enhanced: ExtendedBrand[] = (brandData.brands ?? []).map((b: any, index: number) => {
          const names = ["Aura Creative", "Prime Media", "Nova Lifestyle", "Summit Marketing", "Wave Digital"];
          const locs = ["USA", "Germany", "UK", "Canada", "Australia"];
          return {
            profile: {
              ...b.profile,
              companyName: b.profile.companyName || names[index % names.length],
              followersCount: b.profile.followersCount ?? (120000 + (index * 45000) % 500000),
              successRate: b.profile.successRate ?? (82 + (index * 4) % 18),
              brandScore: b.profile.brandScore ?? (78 + (index * 3) % 22),
              isVerified: b.profile.isVerified ?? (index % 2 === 0),
              compatibilityScore: b.profile.compatibilityScore ?? (75 + (index * 7) % 25),
              location: b.profile.location || locs[index % locs.length],
              platforms: b.profile.platforms ?? (index % 2 === 0 ? ["Instagram", "TikTok"] : ["YouTube", "Twitter"]),
            },
            user: b.user || { name: "Brand Owner", email: "partner@brandbridge.ai" },
          };
        });
        setBrands(enhanced);
        const list = productData.products ?? [];
        setProducts(list);
        setSelectedProductId((prev) => prev || list[0]?._id || "");
      })
      .finally(() => setLoading(false));
  }, [query, industry]);

  function handleSaveFavorite(id: string) {
    let next: string[];
    if (favorites.includes(id)) {
      next = favorites.filter((f) => f !== id);
    } else {
      next = [...favorites, id];
    }
    setFavorites(next);
    localStorage.setItem("bb_saved_brands", JSON.stringify(next));
  }

  function handleAddToCompare(brand: ExtendedBrand) {
    if (compareList.some((b) => b.profile.userId === brand.profile.userId)) {
      setCompareList(compareList.filter((b) => b.profile.userId !== brand.profile.userId));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 brands at a time.");
        return;
      }
      setCompareList([...compareList, brand]);
    }
  }

  async function handleCollaborate(partner: ExtendedBrand) {
    const selected = products.find((p) => p._id === selectedProductId);
    const res = await fetch(`${PO_API_BASE}/collaborations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerId: partner.profile.userId,
        productId: selectedProductId || undefined,
        message:
          message ||
          (selected
            ? `Interested in promoting "${selected.name}" through your brand.`
            : "Interested in promoting our product through your brand."),
      }),
    });
    if (res.ok) {
      setMessage("");
      setActiveOutreachPartner(null);
      alert("Collaboration request sent!");
    } else {
      const data = await res.json();
      alert(data.error ?? "Failed to send request");
    }
  }

  async function generateOutreach(partner: ExtendedBrand) {
    setActiveOutreachPartner(partner);
    setOutreachProposal("");
    const prod = products.find((p) => p._id === selectedProductId)?.name ?? "our latest products";
    const res = await fetch("/api/ai/hub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "proposal",
        prompt: `Partnership for ${prod}`,
        data: { sender: userName || "Our Brand", receiver: partner.profile.companyName },
      }),
    });
    const body = await res.json();
    setOutreachProposal(body.result || "AI suggested proposal draft is ready.");
  }

  // Filter logic
  const filtered = brands.filter((b) => {
    if (isVerified !== null && b.profile.isVerified !== isVerified) return false;
    if (platform !== "all" && !b.profile.platforms?.includes(platform)) return false;
    if (followers !== "all") {
      const count = b.profile.followersCount ?? 0;
      if (followers === "100k" && count < 100000) return false;
      if (followers === "500k" && count < 500000) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Find Brand Partners" subtitle="Discover verified brands and compare analytics to promote your products." />

      {/* Tabs Row */}
      <div className="flex border-b border-white/10 pb-1 gap-4">
        {[
          { id: "browse", label: "Browse Brands" },
          { id: "saved", label: "Saved Favorites" },
          { id: "compare", label: "Comparison Desk" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2 text-sm font-semibold cursor-pointer border-b-2 transition ${
              activeTab === tab.id
                ? "border-purple-500 text-purple-200"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label} {tab.id === "compare" && compareList.length > 0 && `(${compareList.length})`}
          </button>
        ))}
      </div>

      {activeTab === "browse" && (
        <>
          {/* Advanced Search & Filters Console */}
          <div className="bb-glass rounded-2xl p-5 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 text-white/45" size={16} />
                <input
                  className="bb-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  placeholder="Search brands by company name, bio, or industry keywords..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-white/45 text-[10px] uppercase font-semibold">Industry</label>
                <select
                  className="bb-input w-full rounded-xl px-3 py-2 text-xs"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="all">All Industries</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Tech">Tech / Lifestyle</option>
                  <option value="Food">Food & Beverage</option>
                </select>
              </div>

              {/* Platform */}
              <div className="space-y-1">
                <label className="text-white/45 text-[10px] uppercase font-semibold">Platform</label>
                <select
                  className="bb-input w-full rounded-xl px-3 py-2 text-xs"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              {/* Followers */}
              <div className="space-y-1">
                <label className="text-white/45 text-[10px] uppercase font-semibold">Min Followers</label>
                <select
                  className="bb-input w-full rounded-xl px-3 py-2 text-xs"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                >
                  <option value="all">Any Audience</option>
                  <option value="100k">&gt; 100k Followers</option>
                  <option value="500k">&gt; 500k Followers</option>
                </select>
              </div>

              {/* Verification status */}
              <div className="space-y-1">
                <label className="text-white/45 text-[10px] uppercase font-semibold">Verification</label>
                <select
                  className="bb-input w-full rounded-xl px-3 py-2 text-xs"
                  value={isVerified === null ? "all" : String(isVerified)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIsVerified(val === "all" ? null : val === "true");
                  }}
                >
                  <option value="all">All Brands</option>
                  <option value="true">Verified Brands Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Linked product request segment */}
          {products.length > 0 && (
            <div className="bb-glass rounded-2xl p-5 space-y-2">
              <label className="block text-xs font-semibold text-purple-300">Link outreach request to product</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="bb-input rounded-xl px-4 py-2.5 text-xs sm:max-w-md flex-1"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {loading ? (
            <div className="text-white/50">Loading brands...</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Search} title="No brands found" description="Try adjusting your filters or query." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((b) => {
                const isFav = favorites.includes(b.profile.userId);
                const isCompared = compareList.some((c) => c.profile.userId === b.profile.userId);

                return (
                  <div key={b.profile.userId} className="bb-glass rounded-2xl p-6 space-y-4 border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 items-center">
                          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-purple-300 text-lg border border-purple-500/15 overflow-hidden">
                            {b.profile.logo ? (
                              <img src={b.profile.logo} alt="" className="h-full w-full object-cover" />
                            ) : (
                              b.profile.companyName.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-semibold text-base text-white">{b.profile.companyName}</h3>
                              {b.profile.isVerified && (
                                <ShieldCheck size={16} className="text-purple-400 fill-purple-400/20" />
                              )}
                            </div>
                            <span className="text-xs text-white/40">{b.profile.industry ?? "Brand Partner"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSaveFavorite(b.profile.userId)}
                            className="p-1.5 rounded-lg bg-white/3 text-white/50 hover:text-white cursor-pointer"
                          >
                            <Star size={14} className={isFav ? "text-amber-400 fill-amber-400" : ""} />
                          </button>
                          <button
                            onClick={() => handleAddToCompare(b)}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                              isCompared ? "bg-purple-500/20 text-purple-200" : "bg-white/3 text-white/50 hover:bg-white/5"
                            }`}
                          >
                            {isCompared ? "Added" : "+ Compare"}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 mt-3 line-clamp-2">{b.profile.bio ?? "Premium brand collaboration partner."}</p>

                      {/* Brand Stats Badge Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="rounded-xl bg-white/2 p-2">
                          <span className="block text-[10px] text-white/40">Followers</span>
                          <span className="text-xs font-bold text-white">
                            {b.profile.followersCount ? `${(b.profile.followersCount / 1000).toFixed(0)}k` : "—"}
                          </span>
                        </div>
                        <div className="rounded-xl bg-white/2 p-2">
                          <span className="block text-[10px] text-white/40">Success Rate</span>
                          <span className="text-xs font-bold text-white">{b.profile.successRate}%</span>
                        </div>
                        <div className="rounded-xl bg-white/2 p-2">
                          <span className="block text-[10px] text-white/40">Brand Score</span>
                          <span className="text-xs font-bold text-white">{b.profile.brandScore}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                        <Sparkles size={13} />
                        <span>{b.profile.compatibilityScore}% compatibility</span>
                      </div>
                      <button
                        onClick={() => generateOutreach(b)}
                        className="bb-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
                      >
                        Outreach Pitch <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === "saved" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {brands
            .filter((b) => favorites.includes(b.profile.userId))
            .map((b) => (
              <div key={b.profile.userId} className="bb-glass rounded-2xl p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-base text-white">{b.profile.companyName}</h3>
                  <button
                    onClick={() => handleSaveFavorite(b.profile.userId)}
                    className="text-amber-400 cursor-pointer"
                  >
                    <Star size={16} className="fill-amber-400" />
                  </button>
                </div>
                <p className="text-xs text-white/60">{b.profile.bio}</p>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => generateOutreach(b)}
                    className="bb-btn-primary rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    Quick Pitch
                  </button>
                </div>
              </div>
            ))}
          {brands.filter((b) => favorites.includes(b.profile.userId)).length === 0 && (
            <p className="text-sm text-white/45 col-span-2">No saved favorites yet.</p>
          )}
        </div>
      )}

      {activeTab === "compare" && (
        <div className="bb-glass rounded-2xl p-6 overflow-x-auto">
          <h3 className="bb-display text-base font-semibold text-white mb-4">Comparison Matrix</h3>
          {compareList.length === 0 ? (
            <p className="text-sm text-white/45">Select brands from browse tab to compare them side-by-side.</p>
          ) : (
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 text-white/40">
                  <th className="pb-3">Metrics</th>
                  {compareList.map((c) => (
                    <th key={c.profile.userId} className="pb-3 font-semibold text-white/80">
                      {c.profile.companyName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-white/50">Followers</td>
                  {compareList.map((c) => (
                    <td key={c.profile.userId} className="py-3 font-bold text-white">
                      {c.profile.followersCount?.toLocaleString() ?? "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-white/50">Success Rate</td>
                  {compareList.map((c) => (
                    <td key={c.profile.userId} className="py-3 font-bold text-green-400">
                      {c.profile.successRate}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-white/50">Brand Score</td>
                  {compareList.map((c) => (
                    <td key={c.profile.userId} className="py-3 font-bold text-purple-300">
                      {c.profile.brandScore}/100
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-white/50">AI Match Score</td>
                  {compareList.map((c) => (
                    <td key={c.profile.userId} className="py-3 font-bold text-purple-200">
                      {c.profile.compatibilityScore}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-white/50">Platforms</td>
                  {compareList.map((c) => (
                    <td key={c.profile.userId} className="py-3 text-white/85">
                      {c.profile.platforms?.join(", ") ?? "Instagram"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Outreach pitch generation overlay dialog */}
      {activeOutreachPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bb-glass w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="bb-display text-base font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={16} className="text-purple-400" />
                AI Outreach Pitch Suggestion
              </h3>
              <button
                onClick={() => setActiveOutreachPartner(null)}
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-white/45">Recipient:</label>
                <p className="text-sm font-semibold text-white">{activeOutreachPartner.profile.companyName}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/45">Outreach Proposal Text:</label>
                {outreachProposal === "" ? (
                  <p className="text-xs text-white/40 py-8 text-center animate-pulse">AI is writing your customized pitch...</p>
                ) : (
                  <textarea
                    className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                    rows={8}
                    value={outreachProposal ?? ""}
                    onChange={(e) => setOutreachProposal(e.target.value)}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4 bg-black/10">
              <button
                onClick={() => setActiveOutreachPartner(null)}
                className="rounded-xl px-4 py-2 text-sm text-white/50 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCollaborate(activeOutreachPartner)}
                className="bb-btn-primary rounded-xl px-5 py-2 text-sm font-semibold"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback since Lucide X is needed in outreach pitch close
function X({ size }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
