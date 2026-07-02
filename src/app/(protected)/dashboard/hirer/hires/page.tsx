"use client";

import { useState, useEffect } from "react";
import { Handshake } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

import type { HireItem } from "@/lib/dashboard-types";

export default function HirerHiresPage() {
  const [hires, setHires] = useState<HireItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/hires").then((r) => r.json()).then((d) => setHires(d.hires ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/hires/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="My Hires" subtitle="Manage freelancers you've hired" />
      {hires.length === 0 ? (
        <EmptyState icon={Handshake} title="No hires yet" description="Browse freelancers and send hire requests." />
      ) : (
        <div className="space-y-4">
          {hires.map((h) => (
            <div key={h._id} className="bb-glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="bb-display font-medium">{h.freelancerId?.name ?? "Freelancer"}</h3>
                  {h.campaignId?.title && <p className="text-xs text-white/40">{h.campaignId.title}</p>}
                  <span className="mt-1 inline-block text-xs capitalize text-purple-300">{h.status}</span>
                </div>
                <div className="text-right">
                  {h.rate != null && <p className="text-sm text-purple-200">${h.rate}</p>}
                  {h.status === "pending" && (
                    <button onClick={() => updateStatus(h._id, "active")} className="bb-btn-primary mt-2 rounded-xl px-3 py-1 text-xs">Activate</button>
                  )}
                  {h.status === "active" && (
                    <button onClick={() => updateStatus(h._id, "completed")} className="mt-2 rounded-xl border border-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/5">Complete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
