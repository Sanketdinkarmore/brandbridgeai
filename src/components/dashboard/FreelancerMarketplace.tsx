"use client";

import { useState, useEffect, useMemo } from "react";
import { UserPlus } from "lucide-react";
import PageHeader from "./PageHeader";
import SearchFilterBar from "./SearchFilterBar";
import FreelancerCard from "./FreelancerCard";
import EmptyState from "./EmptyState";
import type { UserRole } from "@/lib/roles";

interface FreelancerMarketplaceProps {
  role: UserRole;
  title?: string;
  subtitle?: string;
}

import type { FreelancerItem } from "@/lib/dashboard-types";

export default function FreelancerMarketplace({
  role,
  title = "Browse Freelancers",
  subtitle = "Find creative professionals for your campaigns",
}: FreelancerMarketplaceProps) {
  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    fetch(`/api/freelancers?${params}`)
      .then((r) => r.json())
      .then((d) => setFreelancers(d.freelancers ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [query, category]);

  async function handleHire(freelancerId: string) {
    const rate = prompt("Enter hourly rate (optional):");
    await fetch("/api/hires", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        freelancerId,
        rate: rate ? Number(rate) : undefined,
      }),
    });
    alert("Hire request sent!");
  }

  async function handleSave(freelancerId: string, saved: boolean) {
    if (saved) {
      await fetch(`/api/saved-freelancers?freelancerId=${freelancerId}`, { method: "DELETE" });
    } else {
      await fetch("/api/saved-freelancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelancerId }),
      });
    }
    load();
  }

  async function handleMessage(recipientId: string) {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId, text: "Hi! I'd like to discuss a project." }),
    });
    window.location.href = `/dashboard/${role}/messages`;
  }

  const categories = useMemo(() => {
    const cats = new Set<string>();
    freelancers.forEach((f) => {
      f.freelancerProfile?.categories?.forEach((c) => cats.add(c));
    });
    return Array.from(cats);
  }, [freelancers]);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search freelancers..."
        filters={
          <select
            className="bb-input rounded-xl px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        }
      />
      {loading ? (
        <div className="text-white/50">Loading freelancers...</div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No freelancers found"
          description="Try adjusting your search or check back later."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {freelancers.map((f) => (
            <FreelancerCard
              key={f.user?._id}
              name={f.user?.name ?? "Freelancer"}
              avatar={f.profile?.avatar}
              skills={f.freelancerProfile?.skills}
              categories={f.freelancerProfile?.categories}
              hourlyRate={f.freelancerProfile?.hourlyRate}
              rating={f.freelancerProfile?.rating}
              portfolio={f.portfolio}
              saved={f.saved}
              onHire={() => handleHire(f.user!._id)}
              onSave={() => handleSave(f.user!._id, !!f.saved)}
              onMessage={() => handleMessage(f.user!._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
