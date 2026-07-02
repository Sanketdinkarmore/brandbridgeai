"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import EmptyState from "@/components/dashboard/EmptyState";

import type { HireItem } from "@/lib/dashboard-types";

export default function EarningsPage() {
  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hires").then((r) => r.json()).then((d) => setHires(d.hires ?? [])).finally(() => setLoading(false));
  }, []);

  const completed = hires.filter((h) => h.status === "completed");
  const active = hires.filter((h) => h.status === "active");
  const totalEarnings = completed.reduce((sum, h) => sum + (h.rate ?? 0), 0);

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your project income" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Earnings" value={`$${totalEarnings}`} icon={DollarSign} />
        <StatCard label="Active Projects" value={String(active.length)} icon={DollarSign} />
        <StatCard label="Completed Jobs" value={String(completed.length)} icon={DollarSign} />
      </div>
      {hires.length === 0 ? (
        <EmptyState icon={DollarSign} title="No earnings yet" description="Complete projects to start earning." />
      ) : (
        <div className="space-y-4">
          {hires.map((h) => (
            <div key={h._id} className="bb-glass flex items-center justify-between rounded-2xl p-5">
              <div>
                <h3 className="bb-display font-medium">{h.hirerId?.name ?? "Client"}</h3>
                <span className="text-xs capitalize text-purple-300">{h.status}</span>
              </div>
              <div className="text-lg font-semibold text-purple-200">${h.rate ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
