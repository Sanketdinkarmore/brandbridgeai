"use client";

import ProductStatusBadge from "./ProductStatusBadge";
import type { CollaborationRequestItem } from "../lib/types";

interface CollaborationRequestCardProps {
  item: CollaborationRequestItem;
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function CollaborationRequestCard({
  item,
  onAccept,
  onDecline,
}: CollaborationRequestCardProps) {
  const partnerName = item.partnerId?.name ?? "Partner";
  const productName = item.productId?.name;

  return (
    <div className="bb-glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="bb-display font-medium">{partnerName}</h3>
          {productName && (
            <p className="mt-0.5 text-xs text-purple-300">Product: {productName}</p>
          )}
        </div>
        <ProductStatusBadge status={item.status} />
      </div>
      {item.message && (
        <p className="mt-3 text-sm text-white/55">{item.message}</p>
      )}
      {item.compatibilityScore != null && (
        <p className="mt-2 text-xs text-white/45">
          Compatibility: {item.compatibilityScore}%
        </p>
      )}
      {item.status === "pending" && (onAccept || onDecline) && (
        <div className="mt-4 flex gap-2">
          {onAccept && (
            <button
              type="button"
              onClick={onAccept}
              className="bb-btn-primary flex-1 rounded-xl py-2 text-xs"
            >
              Accept
            </button>
          )}
          {onDecline && (
            <button
              type="button"
              onClick={onDecline}
              className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-white/60 hover:bg-white/5"
            >
              Decline
            </button>
          )}
        </div>
      )}
    </div>
  );
}
