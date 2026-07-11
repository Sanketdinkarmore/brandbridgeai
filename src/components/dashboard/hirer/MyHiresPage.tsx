"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, Loader2, Calendar, FileText, CheckCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CardSkeleton } from "@/components/dashboard/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import { UserRole } from "@/lib/roles";

export default function MyHiresPage({ role }: { role?: UserRole }) {
  const [hires, setHires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadHires = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/hires?${params.toString()}`);
      const data = await res.json();
      if (data.hires) {
        setHires(data.hires);
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(loadHires, 300);
    return () => clearTimeout(t);
  }, [loadHires]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bb-display text-2xl font-semibold sm:text-3xl">My Hires</h1>
          <p className="mt-1 text-sm text-white/55">Manage your active and past freelancer contracts.</p>
        </div>
        <Link
          href={`/dashboard/${role}/freelancers`}
          className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
        >
          <Search size={16} />
          Hire Freelancers
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {["all", "active", "completed", "declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === tab
                  ? "border-b-2 border-purple-500 text-purple-300"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : hires.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No hires found"
          description={
            statusFilter !== "all" 
              ? `You don't have any ${statusFilter} hires.` 
              : "You haven't hired any freelancers yet."
          }
          action={
            <Link
              href={`/dashboard/${role}/freelancers`}
              className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
            >
              Browse Marketplace
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {hires.map((hire) => (
            <div key={hire._id} className="bb-glass flex flex-col rounded-2xl p-6 relative">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {hire.freelancerAvatar ? (
                    <Image src={hire.freelancerAvatar} alt={hire.freelancerName} width={48} height={48} className="rounded-full object-cover w-12 h-12" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-lg font-bold text-purple-300">
                      {hire.freelancerName?.charAt(0) || "F"}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-white">{hire.freelancerName}</h3>
                    <p className="text-sm text-white/50">{hire.projectTitle}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                  hire.status === "active" ? "bg-green-500/10 text-green-400" :
                  hire.status === "completed" ? "bg-blue-500/10 text-blue-400" :
                  hire.status === "declined" ? "bg-red-500/10 text-red-400" :
                  "bg-white/10 text-white/50"
                }`}>
                  {hire.status}
                </span>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-white/5 p-4 text-sm">
                <div>
                  <p className="text-xs text-white/40 mb-1">Budget</p>
                  <p className="font-medium text-white">${hire.budgetAmount} {hire.budgetType === "hourly" ? "/hr" : "Fixed"}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Start Date</p>
                  <p className="font-medium text-white">{new Date(hire.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`/dashboard/${role}/messages?hire=${hire._id}`}
                  className="bb-btn-primary flex-1 flex justify-center items-center gap-2 rounded-xl py-2.5 text-sm font-medium"
                >
                  <FileText size={16} />
                  Manage Contract
                </Link>
                {hire.status === "active" && (
                  <button className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition">
                    <CheckCircle size={16} className="text-green-400" />
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
