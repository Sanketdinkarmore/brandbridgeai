"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import BrandCard from "@/components/dashboard/BrandCard";
import SearchFilterBar from "@/components/dashboard/SearchFilterBar";
import EmptyState from "@/components/dashboard/EmptyState";

import type { BrandItem } from "@/lib/dashboard-types";

export default function FindBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    fetch(`/api/brands?${params}`).then((r) => r.json()).then((d) => setBrands(d.brands ?? [])).finally(() => setLoading(false));
  }, [query]);

  async function handleCollaborate(partnerId: string) {
    await fetch("/api/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, message: "Interested in promoting our product through your brand." }),
    });
    alert("Collaboration request sent!");
  }

  return (
    <div>
      <PageHeader title="Find Brands" subtitle="Discover brands to promote your products" />
      <SearchFilterBar query={query} onQueryChange={setQuery} placeholder="Search brands..." />
      {loading ? <div className="text-white/50">Loading...</div> : brands.length === 0 ? (
        <EmptyState icon={Search} title="No brands found" description="Try adjusting your search or check back later." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {brands.map((b) => (
            <BrandCard
              key={b.profile.userId}
              companyName={b.profile.companyName}
              industry={b.profile.industry}
              location={b.profile.location}
              targetAudience={b.profile.targetAudience}
              logo={b.profile.logo}
              onCollaborate={() => handleCollaborate(b.profile.userId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
