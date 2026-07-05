"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles, Handshake, Megaphone, Store, Globe } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";
import StatCard, { type StatCardConfig } from "@/components/dashboard/StatCard";
import QuickActionsBar from "@/components/dashboard/brand/QuickActionsBar";
import ProfileCompletenessWidget from "@/components/dashboard/brand/ProfileCompletenessWidget";
import EscrowOverviewCard from "@/components/dashboard/brand/EscrowOverviewCard";
import ActivityFeed, { type ActivityItem } from "@/components/dashboard/brand/ActivityFeed";
import BrandRecommendationCard, {
  type BrandRecommendation,
} from "@/components/dashboard/brand/BrandRecommendationCard";
import BrandDetailModal, {
  type BrandDetail,
  type CompatibilityDetail,
} from "@/components/dashboard/brand/BrandDetailModal";
import ProposalPreviewModal from "@/components/dashboard/brand/ProposalPreviewModal";
import PendingProposalRow, {
  type PendingProposal,
} from "@/components/dashboard/brand/PendingProposalRow";
import RecommendedFreelancersSection, {
  type RecommendedFreelancer,
} from "@/components/dashboard/brand/RecommendedFreelancersSection";
import {
  StatCardSkeleton,
  CardSkeleton,
  RecommendationSkeleton,
} from "@/components/dashboard/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import ExternalBrandCard from "@/components/dashboard/brand/ExternalBrandCard";
import OutreachEmailModal from "@/components/dashboard/brand/OutreachEmailModal";
import type { ExternalBrandRecommendation } from "@/lib/ai/matching";

interface UserData {
  name: string;
}

const STAT_META: Omit<StatCardConfig, "value">[] = [
  {
    label: "Brand Matches",
    icon: Sparkles,
    href: "/dashboard/brand/matches",
    emptyMessage: "Discover compatible brand partners with AI",
    emptyCta: "Explore AI Matches",
  },
  {
    label: "Active Collaborations",
    icon: Handshake,
    href: "/dashboard/brand/collaborations",
    emptyMessage: "No active collaborations yet",
    emptyCta: "Explore AI Matches",
  },
  {
    label: "Campaigns",
    icon: Megaphone,
    href: "/dashboard/brand/campaigns",
    emptyMessage: "You haven't launched a campaign",
    emptyCta: "Create Campaign",
  },
  {
    label: "Freelancers Hired",
    icon: Store,
    href: "/dashboard/brand/hires",
    emptyMessage: "No freelancers hired yet",
    emptyCta: "Hire Freelancer",
  },
];

export default function BrandDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ label: string; value: number }[]>([]);
  const [recommendations, setRecommendations] = useState<BrandRecommendation[]>([]);
  const [externalRecommendations, setExternalRecommendations] = useState<ExternalBrandRecommendation[]>([]);
  const [externalLoading, setExternalLoading] = useState(true);
  const [externalSource, setExternalSource] = useState<"ai" | "curated" | "none">("none");
  const [externalQuotaBlocked, setExternalQuotaBlocked] = useState(false);
  const externalFetchStarted = useRef(false);
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);
  const [freelancers, setFreelancers] = useState<RecommendedFreelancer[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [profileCompleteness, setProfileCompleteness] = useState({ percent: 0, missing: [] as string[] });
  const [escrow, setEscrow] = useState({ inEscrow: 0, released: 0, pending: 0 });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandDetail | null>(null);
  const [selectedCompat, setSelectedCompat] = useState<CompatibilityDetail | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalText, setProposalText] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [proposalPartnerName, setProposalPartnerName] = useState("");

  const [outreachOpen, setOutreachOpen] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachTargetName, setOutreachTargetName] = useState("");
  const [outreachEmailDraft, setOutreachEmailDraft] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, dashRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/dashboard/brand", { credentials: "include" }),
      ]);
      const userData = await userRes.json();
      const dashData = await dashRes.json();
      setUser(userData.user);
      if (dashData.stats) setStats(dashData.stats);
      if (dashData.recommendations) setRecommendations(dashData.recommendations);
      if (dashData.pendingProposals) setPendingProposals(dashData.pendingProposals);
      if (dashData.recommendedFreelancers) setFreelancers(dashData.recommendedFreelancers);
      if (dashData.activity) setActivity(dashData.activity);
      if (dashData.profileCompleteness) setProfileCompleteness(dashData.profileCompleteness);
      if (dashData.escrow) setEscrow(dashData.escrow);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExternalBrands = useCallback(async (refresh = false) => {
    setExternalLoading(true);
    try {
      const url = refresh
        ? "/api/ai/external-brands?refresh=true"
        : "/api/ai/external-brands";
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.recommendations) setExternalRecommendations(data.recommendations);
      if (data.source) setExternalSource(data.source);
      setExternalQuotaBlocked(Boolean(data.quotaBlocked));
    } catch (err) {
      console.error(err);
    } finally {
      setExternalLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (externalFetchStarted.current) return;
    externalFetchStarted.current = true;
    loadExternalBrands();
  }, [loadExternalBrands]);

  async function openBrandDetail(brandId: string) {
    setSelectedPartnerId(brandId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/brands/${brandId}`, { credentials: "include" });
      const data = await res.json();
      setSelectedBrand(data.brand ?? null);
      setSelectedCompat(data.compatibility ?? null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function startCollaboration(partnerId: string, partnerName: string) {
    setSelectedPartnerId(partnerId);
    setProposalPartnerName(partnerName);
    setProposalOpen(true);
    setProposalLoading(true);
    setProposalText("");
    setEmailDraft("");
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ partnerId }),
      });
      const data = await res.json();
      setProposalText(data.proposal?.proposal ?? "");
      setEmailDraft(data.proposal?.emailDraft ?? "");
    } finally {
      setProposalLoading(false);
    }
  }

  async function generateOutreachEmail(targetBrandName: string) {
    setOutreachTargetName(targetBrandName);
    setOutreachOpen(true);
    setOutreachLoading(true);
    setOutreachEmailDraft("");
    
    try {
      const res = await fetch("/api/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetBrandName }),
      });
      const data = await res.json();
      setOutreachEmailDraft(data.emailDraft ?? "");
    } catch (err) {
      console.error(err);
      setOutreachEmailDraft("Failed to generate draft. Please try again.");
    } finally {
      setOutreachLoading(false);
    }
  }

  async function sendCollaboration(editedProposal: string) {
    if (!selectedPartnerId) return;
    const score = recommendations.find((r) => r.brandId === selectedPartnerId)?.compatibilityScore;
    await fetch("/api/collaborations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        partnerId: selectedPartnerId,
        proposal: editedProposal,
        emailDraft,
        compatibilityScore: score,
      }),
    });
    setProposalOpen(false);
    setDetailOpen(false);
    loadDashboard();
  }

  async function handleProposalAction(id: string, status: "accepted" | "declined") {
    await fetch(`/api/collaborations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    loadDashboard();
  }

  const statCards: StatCardConfig[] = STAT_META.map((meta, i) => ({
    ...meta,
    value: stats[i]?.value ?? 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          {ROLE_LABELS.brand} Dashboard
        </div>
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Manage brand collaborations and AI-powered partner matching.
        </p>
      </div>

      <QuickActionsBar />

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ProfileCompletenessWidget
              percent={profileCompleteness.percent}
              missing={profileCompleteness.missing}
            />
            <EscrowOverviewCard {...escrow} />
            <ActivityFeed items={activity} />
          </div>

          {/* Registered Brand Matches */}
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-300" />
              <h2 className="bb-display text-lg font-medium">Registered Brand Matches</h2>
            </div>
            {recommendations.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No recommendations yet"
                description="Complete your profile and we'll use Gemini AI to find compatible brand partners."
                action={
                  <button
                    onClick={loadDashboard}
                    className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
                  >
                    Refresh Recommendations
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {recommendations.map((rec) => (
                  <BrandRecommendationCard
                    key={rec.brandId}
                    rec={rec}
                    onViewDetails={() => openBrandDetail(rec.brandId)}
                    onSendRequest={() => startCollaboration(rec.brandId, rec.companyName)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Discover External Brands */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="mb-4 flex items-center gap-2">
              <Globe size={18} className="text-purple-300" />
              <h2 className="bb-display text-lg font-medium">Discover External Brands</h2>
            </div>
            <p className="mb-4 text-sm text-white/50">
              {externalSource === "ai"
                ? "AI-generated suggestions for real-world brands that align with your profile. These brands are not yet on BrandBridge."
                : externalSource === "curated"
                  ? "Profile-matched brand suggestions while Gemini AI is rate-limited. Refresh in a few minutes for fully AI-generated leads."
                  : "AI-generated suggestions for real-world brands that align with your profile. These brands are not yet on BrandBridge."}
            </p>
            {externalQuotaBlocked && externalSource === "curated" && (
              <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200/90">
                Gemini API quota reached — showing curated matches for your industry. Wait ~5 minutes, then click Retry for fresh AI suggestions.
              </p>
            )}
            {externalLoading ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RecommendationSkeleton key={i} />
                ))}
              </div>
            ) : externalRecommendations.length === 0 ? (
              <EmptyState
                icon={Globe}
                title="No external leads found"
                description={
                  externalQuotaBlocked
                    ? "Gemini API quota is temporarily exceeded. Wait a few minutes and retry, or complete your industry and location in your profile for better matches."
                    : "We couldn't generate external brand leads. Ensure GEMINI_API_KEY is set in .env.local and your profile is complete."
                }
                action={
                  <button
                    onClick={() => loadExternalBrands(true)}
                    className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
                  >
                    Retry AI Suggestions
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {externalRecommendations.map((rec) => (
                  <ExternalBrandCard
                    key={rec.companyName}
                    rec={rec}
                    onGenerateOutreach={() => generateOutreachEmail(rec.companyName)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pending Proposals */}
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Handshake size={18} className="text-purple-300" />
              <h2 className="bb-display text-lg font-medium">Pending Proposals</h2>
            </div>
            <div className="bb-glass rounded-2xl p-6">
              {pendingProposals.length === 0 ? (
                <EmptyState
                  icon={Handshake}
                  title="No pending proposals right now"
                  description="Collaboration requests you send or receive will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {pendingProposals.map((p) => (
                    <PendingProposalRow
                      key={p._id}
                      item={p}
                      onAccept={
                        p.isIncoming
                          ? () => handleProposalAction(p._id, "accepted")
                          : undefined
                      }
                      onDecline={
                        p.isIncoming
                          ? () => handleProposalAction(p._id, "declined")
                          : undefined
                      }
                      onView={
                        p.proposal
                          ? () => {
                              setProposalText(p.proposal!);
                              setEmailDraft("");
                              setProposalPartnerName(p.partnerName);
                              setProposalOpen(true);
                              setProposalLoading(false);
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended Freelancers */}
          <div className="mt-8">
            <RecommendedFreelancersSection freelancers={freelancers} />
          </div>
        </>
      )}

      <BrandDetailModal
        open={detailOpen}
        loading={detailLoading}
        brand={selectedBrand}
        compatibility={selectedCompat}
        onClose={() => setDetailOpen(false)}
        onSendRequest={() => {
          if (selectedPartnerId && selectedBrand) {
            startCollaboration(
              selectedPartnerId,
              selectedBrand.companyName || selectedBrand.name,
            );
          }
        }}
      />

      <ProposalPreviewModal
        open={proposalOpen}
        loading={proposalLoading}
        partnerName={proposalPartnerName}
        proposal={proposalText}
        emailDraft={emailDraft}
        onClose={() => setProposalOpen(false)}
        onSend={sendCollaboration}
      />

      <OutreachEmailModal
        open={outreachOpen}
        loading={outreachLoading}
        targetBrandName={outreachTargetName}
        emailDraft={outreachEmailDraft}
        onClose={() => setOutreachOpen(false)}
      />
    </div>
  );
}
