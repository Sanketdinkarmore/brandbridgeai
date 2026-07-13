"use client";

import { X, Star, Calendar, MapPin, CheckCircle } from "lucide-react";
import type { FreelancerItem } from "@/lib/dashboard-types";

interface FreelancerDetailModalProps {
  freelancer: FreelancerItem;
  onClose: () => void;
  onHire: () => void;
  onMessage: () => void;
}

export default function FreelancerDetailModal({ freelancer, onClose, onHire, onMessage }: FreelancerDetailModalProps) {
  const profile = freelancer.profile as any;
  const fProfile = freelancer.freelancerProfile as any;
  const rating = fProfile?.rating || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-[#1a1a24] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-purple-500/20 text-2xl font-semibold text-purple-200">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={freelancer.user?.name} className="h-full w-full object-cover" />
              ) : (
                freelancer.user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="bb-display text-2xl font-semibold">{freelancer.user?.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                {rating > 0 ? (
                  <div className="flex items-center gap-1 text-yellow-400 font-medium">
                    <Star size={14} fill="currentColor" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300 font-medium tracking-wider uppercase">
                    New Freelancer
                  </span>
                )}
                {fProfile?.hourlyRate != null && (
                  <span className="text-white/60 before:content-['•'] before:mr-3 before:text-white/20">${fProfile.hourlyRate}/hr</span>
                )}
                {profile?.location && (
                  <span className="text-white/60 flex items-center gap-1 before:content-['•'] before:mr-3 before:text-white/20">
                    <MapPin size={12} /> {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/70" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-medium text-white mb-3">About</h3>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{profile?.bio || "No bio provided."}</p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-3">Portfolio</h3>
              {freelancer.portfolio && freelancer.portfolio.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {freelancer.portfolio.map((p) => (
                    <div key={p.title} className="group relative aspect-video overflow-hidden rounded-xl bg-white/5 border border-white/10">
                      <img src={p.mediaUrl} alt={p.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium text-white">{p.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">No portfolio items available.</p>
              )}
            </div>
          </div>

          <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 pt-6 lg:pt-0">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">Skills & Categories</h3>
              <div className="flex flex-wrap gap-2">
                {[...(fProfile?.categories || []), ...(fProfile?.skills || [])].map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">Stats & Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Completed Projects</span>
                  <span className="font-medium text-white">{fProfile?.completedProjects || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50 flex items-center gap-2"><Calendar size={14} /> Availability</span>
                  <span className="font-medium text-white capitalize">{fProfile?.availability || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <button onClick={() => { onClose(); onHire(); }} className="w-full bb-btn-primary py-3 rounded-xl text-sm font-medium">
                Hire Freelancer
              </button>
              <button onClick={() => { onClose(); onMessage(); }} className="w-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors py-3 rounded-xl text-sm font-medium text-white/80">
                Send Message
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
