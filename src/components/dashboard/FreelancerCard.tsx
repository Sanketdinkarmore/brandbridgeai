"use client";

import { Star, Heart, UserPlus } from "lucide-react";

interface FreelancerCardProps {
  name: string;
  avatar?: string;
  skills?: string[];
  categories?: string[];
  hourlyRate?: number;
  rating?: number;
  portfolio?: { mediaUrl: string; title: string }[];
  saved?: boolean;
  onHire?: () => void;
  onSave?: () => void;
  onMessage?: () => void;
}

export default function FreelancerCard({
  name,
  avatar,
  skills = [],
  categories = [],
  hourlyRate,
  rating = 0,
  portfolio = [],
  saved,
  onHire,
  onSave,
  onMessage,
}: FreelancerCardProps) {
  return (
    <div className="bb-glass bb-card rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20 text-lg font-semibold text-purple-200">
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="bb-display truncate font-medium">{name}</h3>
            {onSave && (
              <button onClick={onSave} className="text-white/40 hover:text-purple-300">
                <Heart size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-purple-400" : ""} />
              </button>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-yellow-400">
            <Star size={12} fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
            {hourlyRate != null && (
              <span className="ml-2 text-white/45">${hourlyRate}/hr</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[...categories, ...skills].slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      {portfolio.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {portfolio.slice(0, 3).map((p) => (
            <div key={p.title} className="aspect-video overflow-hidden rounded-lg bg-white/5">
              <img src={p.mediaUrl} alt={p.title} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {onHire && (
          <button onClick={onHire} className="bb-btn-primary flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs">
            <UserPlus size={14} />
            Hire
          </button>
        )}
        {onMessage && (
          <button
            onClick={onMessage}
            className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-white/70 hover:bg-white/5"
          >
            Message
          </button>
        )}
      </div>
    </div>
  );
}
