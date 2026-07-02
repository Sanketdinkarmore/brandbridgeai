"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import BrandCard from "@/components/dashboard/BrandCard";
import EmptyState from "@/components/dashboard/EmptyState";

interface Match {
  brandId: string;
  companyName: string;
  industry?: string;
  compatibilityScore: number;
  audienceMatch: string;
  campaignSuggestions: string[];
}

export default function BrandMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function loadMatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 10 }),
      });
      const data = await res.json();
      setMatches(data.matches ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function handleCollaborate(partnerId: string) {
    setGenerating(true);
    try {
      const proposalRes = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });
      const proposalData = await proposalRes.json();

      await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId,
          proposal: proposalData.proposal?.proposal,
          emailDraft: proposalData.proposal?.emailDraft,
          compatibilityScore: matches.find((m) => m.brandId === partnerId)?.compatibilityScore,
        }),
      });
      alert("Collaboration request sent with AI-generated proposal!");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Brand Matching"
        subtitle="Discover compatible brands powered by AI analysis"
        action={
          <button onClick={loadMatches} disabled={loading} className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Refresh Matches
          </button>
        }
      />
      {loading && matches.length === 0 ? (
        <div className="text-white/50">Analyzing brand compatibility...</div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matches yet"
          description="Complete your profile and refresh to get AI-powered brand recommendations."
          action={
            <button onClick={loadMatches} className="bb-btn-primary rounded-xl px-4 py-2 text-sm">
              Find Matches
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {matches.map((m) => (
            <div key={m.brandId}>
              <BrandCard
                companyName={m.companyName}
                industry={m.industry}
                targetAudience={m.audienceMatch}
                compatibilityScore={m.compatibilityScore}
                onCollaborate={() => handleCollaborate(m.brandId)}
              />
              {m.campaignSuggestions?.length > 0 && (
                <div className="mt-2 rounded-xl bg-white/3 px-4 py-3 text-xs text-white/45">
                  <span className="text-purple-300">Campaign ideas: </span>
                  {m.campaignSuggestions.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bb-glass rounded-2xl px-8 py-6 text-center">
            <Loader2 className="mx-auto animate-spin text-purple-400" size={28} />
            <p className="mt-3 text-sm text-white/60">Generating AI proposal...</p>
          </div>
        </div>
      )}
    </div>
  );
}
