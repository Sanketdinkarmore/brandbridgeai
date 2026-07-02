"use client";

import { useState, useEffect } from "react";
import { Handshake } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import type { HireItem } from "@/lib/dashboard-types";

interface MyHiresPageProps {
  viewAs: "hirer" | "freelancer";
  title?: string;
  subtitle?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting response",
  active: "In progress",
  completed: "Completed",
  cancelled: "Declined",
};

export default function MyHiresPage({
  viewAs,
  title = "My Hires",
  subtitle = "Manage freelancer hire requests",
}: MyHiresPageProps) {
  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/hires")
      .then((r) => r.json())
      .then((d) => setHires(d.hires ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/hires/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to update hire");
        return;
      }
      load();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {hires.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No hires yet"
          description={
            viewAs === "freelancer"
              ? "When a brand hires you, requests will appear here."
              : "Browse freelancers and send hire requests."
          }
        />
      ) : (
        <div className="space-y-4">
          {hires.map((h) => {
            const partnerName =
              viewAs === "freelancer"
                ? (h.hirerId?.name ?? "Client")
                : (h.freelancerId?.name ?? "Freelancer");
            const isUpdating = updatingId === h._id;

            return (
              <div key={h._id} className="bb-glass rounded-2xl p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="bb-display font-medium">{partnerName}</h3>
                    {h.campaignId?.title && (
                      <p className="text-xs text-white/40">{h.campaignId.title}</p>
                    )}
                    <span className="mt-1 inline-block text-xs capitalize text-purple-300">
                      {STATUS_LABELS[h.status] ?? h.status}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    {h.rate != null && (
                      <p className="text-lg font-semibold text-purple-200">${h.rate}</p>
                    )}
                    {viewAs === "freelancer" && h.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus(h._id, "active")}
                          className="bb-btn-primary rounded-xl px-4 py-2 text-xs"
                        >
                          Accept
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus(h._id, "cancelled")}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {viewAs === "hirer" && h.status === "pending" && (
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-white/45">Waiting for freelancer to accept</p>
                        <button
                          disabled={isUpdating}
                          onClick={() => updateStatus(h._id, "cancelled")}
                          className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
                        >
                          Cancel request
                        </button>
                      </div>
                    )}
                    {h.status === "active" && (
                      <button
                        disabled={isUpdating}
                        onClick={() => updateStatus(h._id, "completed")}
                        className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/70 hover:bg-white/5"
                      >
                        Mark completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
