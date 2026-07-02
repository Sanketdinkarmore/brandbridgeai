"use client";

import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import MyHiresPage from "@/components/dashboard/MyHiresPage";
import type { HireItem } from "@/lib/dashboard-types";

export default function EarningsPage() {
  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hires")
      .then((r) => r.json())
      .then((d) => setHires(d.hires ?? []))
      .finally(() => setLoading(false));
  }, []);

  const completed = hires.filter((h) => h.status === "completed");
  const active = hires.filter((h) => h.status === "active");
  const pending = hires.filter((h) => h.status === "pending");
  const totalEarnings = completed.reduce((sum, h) => sum + (h.rate ?? 0), 0);

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your project income and hire requests" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Earnings" value={`$${totalEarnings}`} icon={DollarSign} />
        <StatCard label="Pending Requests" value={String(pending.length)} icon={DollarSign} />
        <StatCard label="Active Projects" value={String(active.length)} icon={DollarSign} />
        <StatCard label="Completed Jobs" value={String(completed.length)} icon={DollarSign} />
      </div>
      <MyHiresPage
        viewAs="freelancer"
        title="Hire Requests"
        subtitle="Accept or decline offers from brands"
      />
    </div>
  );
}
