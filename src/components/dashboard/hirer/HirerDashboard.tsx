"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, Briefcase, FileText, MessageSquare, Star, Heart, Clock } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";
import StatCard, { type StatCardConfig } from "@/components/dashboard/StatCard";
import { StatCardSkeleton, CardSkeleton } from "@/components/dashboard/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import Link from "next/link";
import Image from "next/image";

interface UserData {
  name: string;
}

const STAT_META: Omit<StatCardConfig, "value">[] = [
  {
    label: "Freelancers Saved",
    icon: Heart,
    href: "/dashboard/hirer/freelancers",
    emptyMessage: "No freelancers saved",
    emptyCta: "Browse Freelancers",
  },
  {
    label: "Active Hires",
    icon: Briefcase,
    href: "/dashboard/hirer/hires",
    emptyMessage: "No active hires",
    emptyCta: "Browse Freelancers",
  },
  {
    label: "Open Projects",
    icon: FileText,
    href: "/dashboard/hirer/projects",
    emptyMessage: "No open projects",
    emptyCta: "Post a Project",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/dashboard/hirer/messages",
    emptyMessage: "No new messages",
    emptyCta: "Go to Messages",
  },
];

export default function HirerDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ label: string; value: number }[]>([]);
  const [topFreelancers, setTopFreelancers] = useState<any[]>([]);
  const [recentHires, setRecentHires] = useState<any[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, dashRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/dashboard/hirer", { credentials: "include" }),
      ]);
      const userData = await userRes.json();
      const dashData = await dashRes.json();
      
      setUser(userData.user);
      if (dashData.stats) setStats(dashData.stats);
      if (dashData.topFreelancers) setTopFreelancers(dashData.topFreelancers);
      if (dashData.recentHires) setRecentHires(dashData.recentHires);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards: StatCardConfig[] = STAT_META.map((meta, i) => ({
    ...meta,
    value: stats[i]?.value ?? 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          {ROLE_LABELS.hirer} Dashboard
        </div>
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-white/55">
          Find top freelancers and manage your creative projects.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/hirer/projects"
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <FileText size={18} />
          Post a Project
        </Link>
        <Link
          href="/dashboard/hirer/freelancers"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
        >
          <Sparkles size={18} />
          Browse Freelancers
        </Link>
        <Link
          href="/dashboard/hirer/messages"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
        >
          <MessageSquare size={18} />
          Messages
        </Link>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
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

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Top Freelancers */}
            <div className="bb-glass flex flex-col rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="bb-display flex items-center gap-2 text-lg font-medium">
                  <Star size={18} className="text-purple-300" />
                  Top Freelancers
                </h2>
                <Link href="/dashboard/hirer/freelancers" className="text-sm text-purple-400 hover:text-purple-300">
                  View all
                </Link>
              </div>
              
              {topFreelancers.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <div>
                    <Star className="mx-auto mb-2 text-white/20" size={24} />
                    <p className="text-sm text-white/50">No freelancers found yet.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {topFreelancers.map((fp) => (
                    <div key={fp.userId} className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <div className="flex items-center gap-3">
                        {fp.avatar ? (
                          <Image src={fp.avatar} alt={fp.name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">
                            {(fp.name || "F").charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{fp.name}</p>
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <span className="rounded bg-white/10 px-1.5 py-0.5">{fp.skill}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-400">
                              <Star size={12} className="fill-amber-400" />
                              {fp.rating > 0 ? fp.rating.toFixed(1) : "New"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">${fp.hourlyRate}/hr</p>
                        <Link href={`/dashboard/hirer/freelancers?id=${fp.userId}`} className="mt-1 inline-block text-xs text-purple-400 hover:text-purple-300">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Hires */}
            <div className="bb-glass flex flex-col rounded-2xl p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="bb-display flex items-center gap-2 text-lg font-medium">
                  <Clock size={18} className="text-purple-300" />
                  Recent Hires
                </h2>
                <Link href="/dashboard/hirer/hires" className="text-sm text-purple-400 hover:text-purple-300">
                  View all
                </Link>
              </div>

              {recentHires.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
                  <div>
                    <Briefcase className="mx-auto mb-2 text-white/20" size={24} />
                    <p className="text-sm text-white/50">You haven't hired anyone yet.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentHires.map((hire) => (
                    <Link key={hire._id} href={`/dashboard/hirer/hires?id=${hire._id}`} className="block">
                      <div className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
                        <div className="flex items-center gap-3">
                          {hire.freelancerAvatar ? (
                            <Image src={hire.freelancerAvatar} alt={hire.freelancerName} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-sm font-bold text-purple-300">
                              {hire.freelancerName?.charAt(0) || "F"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{hire.freelancerName}</p>
                            <p className="text-xs text-white/50 line-clamp-1">{hire.projectTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
                            hire.status === "active" ? "bg-green-500/10 text-green-400" :
                            hire.status === "completed" ? "bg-blue-500/10 text-blue-400" :
                            "bg-white/10 text-white/50"
                          }`}>
                            {hire.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
