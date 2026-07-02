"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getRoleDashboardConfig,
  ROLE_LABELS,
  type UserRole,
  isValidRole,
  getDashboardPath,
} from "@/lib/roles";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Sparkles } from "lucide-react";

interface UserData {
  name: string;
  role?: UserRole;
}

interface RoleDashboardProps {
  role: UserRole;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
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
              <StatCard key={label} label={label} value={value} icon={icon} />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {panels.map((panel) => (
              <div key={panel.title} className="bb-glass rounded-2xl p-6">
                <h2 className="bb-display text-lg font-medium">{panel.title}</h2>
                {panel.items.length === 0 ? (
                  <p className="mt-4 text-sm text-white/45">
                    {config.panels.find((p) => p.title === panel.title)?.desc ??
                      "No items yet. Get started by exploring the platform."}
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {panel.items.slice(0, 5).map((item: unknown, i: number) => {
                      const rec = item as Record<string, unknown>;
                      const title =
                        (rec.companyName as string) ??
                        (rec.title as string) ??
                        ((rec.initiatorId as { name?: string })?.name) ??
                        ((rec.userId as { name?: string })?.name) ??
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

export { isValidRole };
