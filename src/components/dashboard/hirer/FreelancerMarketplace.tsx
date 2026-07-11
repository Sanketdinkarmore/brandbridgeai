"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Star, MapPin, Heart, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CardSkeleton } from "@/components/dashboard/Skeleton";
import EmptyState from "@/components/dashboard/EmptyState";
import { UserRole } from "@/lib/roles";

export default function FreelancerMarketplace({ role }: { role?: UserRole }) {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "all") params.append("category", category);

      const res = await fetch(`/api/freelancers?${params.toString()}`);
      const data = await res.json();
      if (data.freelancers) {
        setFreelancers(data.freelancers);
      }
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(loadFreelancers, 300);
    return () => clearTimeout(t);
  }, [loadFreelancers]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">Freelancer Marketplace</h1>
        <p className="mt-1 text-sm text-white/55">Discover and hire top creative talent for your projects.</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {["all", "Graphic Design", "Video Editing", "Content Writing", "Web Development"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCategory(tab)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                category === tab
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
              }`}
            >
              {tab === "all" ? "All Categories" : tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            className="bb-input w-full rounded-xl py-2 pl-10 pr-4 text-sm"
            placeholder="Search freelancers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No freelancers found"
          description="Try adjusting your filters or search terms."
          action={
            <button onClick={() => { setSearch(""); setCategory("all"); }} className="bb-btn-primary rounded-xl px-4 py-2 text-sm">
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {freelancers.map((item) => {
            const user = item.user || {};
            const profile = item.profile || {};
            const fp = item.freelancerProfile || {};
            
            return (
              <div key={user._id} className="bb-glass flex flex-col rounded-2xl p-5 transition hover:bg-white/5 relative group">
                <button className="absolute right-4 top-4 text-white/20 hover:text-red-400 transition">
                  <Heart size={18} className={item.saved ? "fill-red-400 text-red-400" : ""} />
                </button>
                
                <div className="mb-4 flex items-center gap-4">
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt={user.name || "User"} width={56} height={56} className="rounded-full object-cover w-14 h-14 ring-2 ring-white/10" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/20 text-xl font-bold text-purple-300 ring-2 ring-purple-500/30">
                      {(user.name || "F").charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-white">{user.name || "Anonymous Freelancer"}</h3>
                    <p className="text-sm text-purple-300">{fp.skills?.[0] || "Creative Professional"}</p>
                  </div>
                </div>

                <div className="mb-4 text-xs text-white/60 line-clamp-2">
                  {profile.bio || "No bio provided."}
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    {profile.avgRating && profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "New"}
                  </span>
                  <span className="flex items-center gap-1 text-white/70">
                    <span className="text-white/40">$</span>
                    {fp.hourlyRate || "N/A"}/hr
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1 text-white/50">
                      <MapPin size={12} />
                      {profile.location}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-white/10">
                  <button className="bb-btn-primary flex-1 rounded-xl py-2 text-sm font-medium">
                    Hire Me
                  </button>
                  <Link
                    href={`/dashboard/${role}/messages?user=${user._id}`}
                    className="rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                  >
                    Message
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
