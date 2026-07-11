"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, FileText, Loader2, Calendar, DollarSign, X } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import { CardSkeleton } from "@/components/dashboard/Skeleton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (search) params.append("search", search);
      
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 400);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bb-display text-2xl font-semibold sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-white/55">Post and manage your creative projects.</p>
        </div>
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
        >
          <Plus size={16} />
          Post a Project
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 border-b border-white/10 pb-1 w-full sm:w-auto overflow-x-auto">
          {["all", "open", "in_progress", "completed", "closed"].map((tab) => (
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
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            className="bb-input w-full rounded-xl py-2 pl-10 pr-4 text-sm"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || statusFilter !== "all" ? "No projects found" : "No projects yet"}
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your filters or search term."
              : "Post a project to start receiving proposals from top freelancers."
          }
          action={
            search || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="bb-btn-primary rounded-xl px-4 py-2 text-sm"
              >
                Post a Project
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <div key={project._id} className="bb-glass rounded-2xl p-5 hover:bg-white/5 transition cursor-pointer">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{project.title}</h3>
                  <p className="text-xs text-white/50 mt-1">{project.category}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
                  project.status === "open" ? "bg-green-500/10 text-green-400" :
                  project.status === "in_progress" ? "bg-blue-500/10 text-blue-400" :
                  project.status === "completed" ? "bg-purple-500/10 text-purple-400" :
                  "bg-white/10 text-white/50"
                }`}>
                  {project.status.replace("_", " ")}
                </span>
              </div>
              
              <div className="mb-4 flex flex-wrap gap-4 text-xs text-white/70">
                <div className="flex items-center gap-1.5">
                  <DollarSign size={14} className="text-white/40" />
                  {project.budgetType === "fixed" ? `$${project.budgetAmount} Fixed` : `$${project.budgetAmount}/hr`}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-white/40" />
                  Due {new Date(project.deadline).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-white/40" />
                  {project.applicantCount} proposals
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {(project.requiredSkills || []).slice(0, 3).map((skill: string) => (
                  <span key={skill} className="rounded bg-white/5 px-2 py-1 text-[10px] text-white/60">
                    {skill}
                  </span>
                ))}
                {(project.requiredSkills?.length || 0) > 3 && (
                  <span className="rounded bg-white/5 px-2 py-1 text-[10px] text-white/60">
                    +{(project.requiredSkills?.length || 0) - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isNewProjectModalOpen && (
        <NewProjectModal
          onClose={() => setIsNewProjectModalOpen(false)}
          onSuccess={() => {
            setIsNewProjectModalOpen(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

function NewProjectModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budgetType: "fixed",
    budgetAmount: "",
    deadline: "",
    skillsStr: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        budgetAmount: Number(form.budgetAmount),
        requiredSkills: form.skillsStr.split(",").map(s => s.trim()).filter(Boolean),
        deadline: new Date(form.deadline).toISOString(),
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0F0F12] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="bb-display text-lg font-medium text-white">Post a Project</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/5 transition-colors">
            <X size={18} className="text-white/50" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6">
          <form id="new-project-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Project Title</label>
              <input
                required
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                placeholder="E.g. Build a landing page for my new brand"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs text-white/50">Description</label>
              <textarea
                required
                rows={4}
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Describe what you need done..."
              />
            </div>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-white/50">Category</label>
                <select
                  required
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Video Editing">Video Editing</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs text-white/50">Deadline</label>
                <input
                  required
                  type="date"
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={form.deadline}
                  onChange={e => setForm({...form, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-white/50">Budget Type</label>
                <select
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={form.budgetType}
                  onChange={e => setForm({...form, budgetType: e.target.value})}
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs text-white/50">Budget Amount ($)</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={form.budgetAmount}
                  onChange={e => setForm({...form, budgetAmount: e.target.value})}
                  placeholder="e.g. 500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-white/50">Required Skills (comma separated)</label>
              <input
                className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                value={form.skillsStr}
                onChange={e => setForm({...form, skillsStr: e.target.value})}
                placeholder="e.g. React, Node.js, Figma"
              />
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
          </form>
        </div>
        
        <div className="border-t border-white/10 px-6 py-4 flex justify-end gap-3 bg-[#131317]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            form="new-project-form"
            type="submit"
            disabled={loading}
            className="bb-btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-2 text-sm"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Post Project
          </button>
        </div>
      </div>
    </div>
  );
}
