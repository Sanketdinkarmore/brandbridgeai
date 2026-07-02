"use client";

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

import type { CampaignItem } from "@/lib/dashboard-types";

export default function FreelancerProjectsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns?open=true").then((r) => r.json()).then((d) => setCampaigns(d.campaigns ?? [])).finally(() => setLoading(false));
  }, []);

  async function handlePropose(campaignId: string) {
    const rate = prompt("Your proposed rate ($):");
    const message = prompt("Proposal message:");
    await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, rate: rate ? Number(rate) : undefined, message }),
    });
    alert("Proposal sent!");
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="Browse Projects" subtitle="Find open campaigns and submit proposals" />
      {campaigns.length === 0 ? (
        <EmptyState icon={Briefcase} title="No open projects" description="Check back later for new campaign opportunities." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c._id} className="bb-glass rounded-2xl p-5">
              <h3 className="bb-display font-medium">{c.title}</h3>
              <p className="mt-1 text-xs text-purple-300">by {c.ownerId?.name ?? "Brand"}</p>
              {c.description && <p className="mt-2 text-sm text-white/45">{c.description}</p>}
              {c.budget != null && <p className="mt-2 text-xs text-white/40">Budget: ${c.budget}</p>}
              <button onClick={() => handlePropose(c._id)} className="bb-btn-primary mt-4 rounded-xl px-4 py-2 text-xs">Send Proposal</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
