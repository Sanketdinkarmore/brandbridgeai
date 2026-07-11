"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getRoleDashboardConfig,
  ROLE_LABELS,
  type UserRole,
  isValidRole,
} from "@/lib/roles";
import StatCard, { type StatCardConfig } from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import BrandDashboard from "@/components/dashboard/brand/BrandDashboard";
import HirerDashboard from "@/components/dashboard/hirer/HirerDashboard";
import { Sparkles, Briefcase, FileText, FolderOpen, DollarSign } from "lucide-react";
import {
  StatCardSkeleton,
  CardSkeleton,
} from "@/components/dashboard/Skeleton";

// Freelancer sub-components
import FreelancerQuickActionsBar from "@/components/dashboard/freelancer/FreelancerQuickActionsBar";
import EarningsOverviewCard from "@/components/dashboard/freelancer/EarningsOverviewCard";
import ProfileCompletenessWidget from "@/components/dashboard/brand/ProfileCompletenessWidget";
import ActivityFeed, { type ActivityItem } from "@/components/dashboard/brand/ActivityFeed";
import ProjectOpportunitiesSection, {
  type ProjectOpportunity,
} from "@/components/dashboard/freelancer/ProjectOpportunitiesSection";
import PendingHireRequestsSection, {
  type PendingHireRequest,
} from "@/components/dashboard/freelancer/PendingHireRequestsSection";
import RecentProposalsSection, {
  type RecentProposal,
} from "@/components/dashboard/freelancer/RecentProposalsSection";
import PortfolioHighlightsSection, {
  type PortfolioHighlight,
} from "@/components/dashboard/freelancer/PortfolioHighlightsSection";
import ActiveProjectsSection, {
  type ActiveProject,
} from "@/components/dashboard/freelancer/ActiveProjectsSection";
import SkillsRatingWidget, {
  type FreelancerMeta,
} from "@/components/dashboard/freelancer/SkillsRatingWidget";

interface UserData {
  name: string;
  role?: UserRole;
}

interface RoleDashboardProps {
  role: UserRole;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
  if (role === "brand") {
    return <BrandDashboard />;
  }

  if (role === "freelancer") {
    return <FreelancerDashboard />;
  }

  if (role === "hirer") {
    return <HirerDashboard />;
  }

  return <GenericRoleDashboard role={role} />;
}

/* ─────────────────────────── Freelancer Dashboard ─────────────────────────── */

const FREELANCER_STAT_META: Omit<StatCardConfig, "value">[] = [
  {
    label: "Active Projects",
    icon: Briefcase,
    href: "/dashboard/freelancer/earnings",
    emptyMessage: "No active projects yet",
    emptyCta: "Browse Projects",
  },
  {
    label: "Pending Requests",
    icon: FileText,
    href: "/dashboard/freelancer/earnings",
    emptyMessage: "No pending hire requests",
    emptyCta: "View Earnings",
  },
  {
    label: "Proposals Sent",
    icon: FolderOpen,
    href: "/dashboard/freelancer/proposals",
    emptyMessage: "No proposals sent yet",
    emptyCta: "Find Projects",
  },
  {
    label: "Total Earnings",
    icon: DollarSign,
    href: "/dashboard/freelancer/earnings",
    emptyMessage: "Start earning from projects",
    emptyCta: "View Earnings",
  },
];

function FreelancerDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ label: string; value: number }[]>([]);
  const [projectOpportunities, setProjectOpportunities] = useState<ProjectOpportunity[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingHireRequest[]>([]);
  const [portfolioHighlights, setPortfolioHighlights] = useState<PortfolioHighlight[]>([]);
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [profileCompleteness, setProfileCompleteness] = useState({ percent: 0, missing: [] as string[] });
  const [earnings, setEarnings] = useState({ total: 0, pending: 0, active: 0, completed: 0 });
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [freelancerMeta, setFreelancerMeta] = useState<FreelancerMeta>({
    rating: 0,
    completedProjects: 0,
    categories: [],
    skills: [],
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, dashRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/dashboard/freelancer", { credentials: "include" }),
      ]);
      const userData = await userRes.json();
      const dashData = await dashRes.json();
      setUser(userData.user);
      if (dashData.stats) setStats(dashData.stats);
      if (dashData.projectOpportunities) setProjectOpportunities(dashData.projectOpportunities);
      if (dashData.pendingRequests) setPendingRequests(dashData.pendingRequests);
      if (dashData.portfolioHighlights) setPortfolioHighlights(dashData.portfolioHighlights);
      if (dashData.recentProposals) setRecentProposals(dashData.recentProposals);
      if (dashData.activity) setActivity(dashData.activity);
      if (dashData.profileCompleteness) setProfileCompleteness(dashData.profileCompleteness);
      if (dashData.earnings) setEarnings(dashData.earnings);
      if (dashData.activeProjects) setActiveProjects(dashData.activeProjects);
      if (dashData.freelancerMeta) setFreelancerMeta(dashData.freelancerMeta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleHireAction(id: string, status: "accepted" | "declined") {
    await fetch(`/api/hires/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    loadDashboard();
  }

  async function handlePropose(campaignId: string) {
    const rate = prompt("Your proposed rate ($):");
    const message = prompt("Proposal message:");
    await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ campaignId, rate: rate ? Number(rate) : undefined, message }),
    });
    loadDashboard();
  }

  const statCards: StatCardConfig[] = FREELANCER_STAT_META.map((meta, i) => ({
    ...meta,
    value: stats[i]?.value ?? 0,
  }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          {ROLE_LABELS.freelancer} Dashboard
        </div>
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Showcase your work and land creative projects.
        </p>
      </div>

      {/* Quick Actions */}
      <FreelancerQuickActionsBar />

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
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Row 1: Profile Completeness, Earnings Overview, Activity Feed */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ProfileCompletenessWidget
              percent={profileCompleteness.percent}
              missing={profileCompleteness.missing}
              profileHref="/dashboard/freelancer/profile"
            />
            <EarningsOverviewCard {...earnings} />
            <ActivityFeed items={activity} />
          </div>

          {/* Row 2: Project Opportunities */}
          <div className="mt-8">
            <ProjectOpportunitiesSection
              projects={projectOpportunities}
              onPropose={handlePropose}
            />
          </div>

          {/* Row 3: Pending Hire Requests */}
          <div className="mt-8">
            <PendingHireRequestsSection
              requests={pendingRequests}
              onAccept={(id) => handleHireAction(id, "accepted")}
              onDecline={(id) => handleHireAction(id, "declined")}
            />
          </div>

          {/* Row 4: Active Projects */}
          <div className="mt-8">
            <ActiveProjectsSection projects={activeProjects} />
          </div>

          {/* Row 5: Recent Proposals */}
          <div className="mt-8">
            <RecentProposalsSection proposals={recentProposals} />
          </div>

          {/* Row 6: Portfolio Highlights + Skills & Rating */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PortfolioHighlightsSection items={portfolioHighlights} />
            <SkillsRatingWidget meta={freelancerMeta} />
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────────── Generic Role Dashboard ────────────────────────── */

function GenericRoleDashboard({ role }: { role: UserRole }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<{ label: string; value: string; icon: typeof Sparkles }[]>([]);
  const [panels, setPanels] = useState<{ title: string; items: unknown[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const config = getRoleDashboardConfig(role);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/dashboard/stats").then((r) => r.json()),
    ]).then(([userData, statsData]) => {
      setUser(userData.user);
      if (statsData.stats) {
        setStats(
          statsData.stats.map((s: { label: string; value: string }, i: number) => ({
            ...s,
            icon: config.stats[i]?.icon ?? Sparkles,
          })),
        );
      } else {
        setStats(config.stats);
      }
      setPanels(statsData.panels ?? config.panels.map((p) => ({ title: p.title, items: [] })));
    }).finally(() => setLoading(false));
  }, [role, config.stats, config.panels]);

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          {ROLE_LABELS[role]} Dashboard
        </div>
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-white/55">{config.subtitle}</p>
      </div>

      {loading ? (
        <div className="text-white/50">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon }) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                icon={icon}
                href={getDashboardPath(role)}
              />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {panels.map((panel) => (
              <div key={panel.title} className="bb-glass rounded-2xl p-6">
                <h2 className="bb-display text-lg font-medium">{panel.title}</h2>
                {panel.items.length === 0 ? (
                  <p className="mt-4 text-sm text-white/45">
                    {config.panels.find((p) => p.title === panel.title)?.desc ??
                      "No items yet."}
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {panel.items.slice(0, 5).map((item: unknown, i: number) => {
                      const rec = item as Record<string, unknown>;
                      const title =
                        (rec.companyName as string) ??
                        (rec.title as string) ??
                        "Item";
                      return (
                        <div key={i} className="rounded-xl bg-white/3 px-4 py-3 text-sm">
                          {title}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function getDashboardPath(role: UserRole) {
  return `/dashboard/${role}`;
}

export { isValidRole };
