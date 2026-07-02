"use client";

import { Check, X } from "lucide-react";

interface CollaborationCardProps {
  partnerName: string;
  status: string;
  message?: string;
  proposal?: string;
  compatibilityScore?: number;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onViewProposal?: () => void;
}

export default function CollaborationCard({
  partnerName,
  status,
  message,
  proposal,
  compatibilityScore,
  isIncoming,
  onAccept,
  onDecline,
  onViewProposal,
}: CollaborationCardProps) {
  const statusColor =
    status === "accepted"
      ? "text-green-400"
      : status === "declined"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div className="bb-glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="bb-display font-medium">{partnerName}</h3>
          <span className={`mt-1 inline-block text-xs capitalize ${statusColor}`}>{status}</span>
          {compatibilityScore != null && (
            <span className="ml-2 text-xs text-purple-300">{compatibilityScore}% match</span>
          )}
        </div>
      </div>
      {message && <p className="mt-3 text-sm text-white/50">{message}</p>}
      {proposal && (
        <div className="mt-3 rounded-xl bg-white/3 p-3">
          <p className="line-clamp-3 text-xs text-white/45">{proposal}</p>
          {onViewProposal && (
            <button onClick={onViewProposal} className="mt-2 text-xs text-purple-300 hover:text-purple-200">
              View full proposal
            </button>
          )}
        </div>
      )}
      {status === "pending" && isIncoming && onAccept && onDecline && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={onAccept}
            className="bb-btn-primary flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs"
          >
            <Check size={14} />
            Accept
          </button>
          <button
            onClick={onDecline}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/10 py-2 text-xs text-white/70 hover:bg-white/5"
          >
            <X size={14} />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
