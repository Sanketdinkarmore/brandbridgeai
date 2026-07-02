"use client";

import { Sparkles, Send } from "lucide-react";

interface BrandCardProps {
  companyName?: string;
  industry?: string;
  location?: string;
  targetAudience?: string;
  logo?: string;
  compatibilityScore?: number;
  onCollaborate?: () => void;
  onView?: () => void;
}

export default function BrandCard({
  companyName,
  industry,
  location,
  targetAudience,
  logo,
  compatibilityScore,
  onCollaborate,
  onView,
}: BrandCardProps) {
  return (
    <div className="bb-glass bb-card rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20">
          {logo ? (
            <img src={logo} alt={companyName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-purple-200">
              {(companyName || "B").charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="bb-display font-medium">{companyName || "Brand"}</h3>
          {industry && <p className="mt-0.5 text-xs text-purple-300">{industry}</p>}
          {location && <p className="text-xs text-white/40">{location}</p>}
          {targetAudience && (
            <p className="mt-2 line-clamp-2 text-xs text-white/45">{targetAudience}</p>
          )}
        </div>
        {compatibilityScore != null && (
          <div className="flex items-center gap-1 rounded-full bg-purple-500/15 px-2.5 py-1 text-xs text-purple-200">
            <Sparkles size={12} />
            {compatibilityScore}%
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        {onCollaborate && (
          <button onClick={onCollaborate} className="bb-btn-primary flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs">
            <Send size={14} />
            Collaborate
          </button>
        )}
        {onView && (
          <button
            onClick={onView}
            className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-white/70 hover:bg-white/5"
          >
            View Profile
          </button>
        )}
      </div>
    </div>
  );
}
