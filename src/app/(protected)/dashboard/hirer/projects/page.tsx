"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

import type { CampaignItem } from "@/lib/dashboard-types";

export default function HirerProjectsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/campaigns").then((r) => r.json()).then((d) => setCampaigns(d.campaigns ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, status: "active" }) });
    setTitle(""); setDescription(""); setShowForm(false); load();
  }

  if (loading) return <div className="text-white/50">Loading...</div>;

  return (
    <div>
      <PageHeader title="Projects" subtitle="Open projects needing freelancers" action={
        <button onClick={() => setShowForm(!showForm)} className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Plus size={16} /> New Project</button>
      } />
      {showForm && (
        <form onSubmit={handleCreate} className="bb-glass mb-6 rounded-2xl p-6 space-y-4">
          <input className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="bb-input w-full rounded-xl px-4 py-2.5 text-sm" placeholder="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          <button type="submit" className="bb-btn-primary rounded-xl px-4 py-2 text-sm">Create Project</button>
        </form>
      )}
      {campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No projects" description="Create a project to find freelancers." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c._id} className="bb-glass rounded-2xl p-5">
              <h3 className="bb-display font-medium">{c.title}</h3>
              <span className="mt-1 inline-block text-xs capitalize text-purple-300">{c.status}</span>
              {c.description && <p className="mt-2 text-sm text-white/45">{c.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
