"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

import type { ProposalItem } from "@/lib/dashboard-types";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/proposals").then((r) => r.json()).then((d) => setProposals(d.proposals ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="Proposals" subtitle="Track your submitted proposals" />
      {proposals.length === 0 ? (
        <EmptyState icon={FileText} title="No proposals sent" description="Browse projects and submit proposals to get hired." />
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <div key={p._id} className="bb-glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="bb-display font-medium">{p.campaignId?.title ?? "Campaign"}</h3>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] capitalize text-purple-300">{p.status}</span>
              </div>
              {p.message && <p className="mt-2 text-sm text-white/45">{p.message}</p>}
              {p.rate != null && <p className="mt-2 text-xs text-white/40">Rate: ${p.rate}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
