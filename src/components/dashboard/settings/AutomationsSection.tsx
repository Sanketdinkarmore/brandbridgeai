"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import type { UserRole } from "@/lib/roles";

interface Automation {
  _id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
}

const ROLE_TRIGGERS: Record<UserRole, { id: string; label: string }[]> = {
  brand: [
    { id: "campaign_approved", label: "Campaign Approved" },
    { id: "collaboration_accepted", label: "Collaboration Accepted" },
  ],
  freelancer: [
    { id: "project_completed", label: "Project Completed" },
    { id: "payment_released", label: "Payment Released" },
  ],
  hirer: [
    { id: "project_approved", label: "Project Approved" },
    { id: "hire_accepted", label: "Hire Accepted" },
  ],
  product_owner: [
    { id: "promotion_accepted", label: "Promotion Accepted" },
    { id: "product_activated", label: "Product Activated" },
  ],
};

const AVAILABLE_ACTIONS = [
  { id: "create_task", label: "Create a Task" },
  { id: "notify_team", label: "Notify Team" },
  { id: "generate_report", label: "Generate Report" },
  { id: "send_email", label: "Send Email Notification" },
];

export default function AutomationsSection({ role }: { role: UserRole }) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuto, setEditingAuto] = useState<Partial<Automation>>({});
  const [modalLoading, setModalLoading] = useState(false);

  const availableTriggers = ROLE_TRIGGERS[role] || ROLE_TRIGGERS.brand;

  useEffect(() => {
    fetchAutomations();
  }, []);

  async function fetchAutomations() {
    setLoading(true);
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      if (data.automations) setAutomations(data.automations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    setSavingId(id);
    try {
      const res = await fetch("/api/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        setAutomations((prev) =>
          prev.map((a) => (a._id === id ? { ...a, isActive: !currentStatus } : a))
        );
      }
    } finally {
      setSavingId(null);
    }
  }

  async function deleteAutomation(id: string) {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      const res = await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAutomations((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function saveModalAutomation(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAuto.name || !editingAuto.trigger || !editingAuto.actions?.length) return;
    setModalLoading(true);
    
    try {
      const method = editingAuto._id ? "PATCH" : "POST";
      const payload = editingAuto._id ? { id: editingAuto._id, ...editingAuto } : editingAuto;
      
      const res = await fetch("/api/automations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchAutomations();
        setIsModalOpen(false);
      }
    } finally {
      setModalLoading(false);
    }
  }

  function openNewModal() {
    setEditingAuto({ name: "", trigger: availableTriggers[0].id, actions: [], isActive: true });
    setIsModalOpen(true);
  }

  function openEditModal(a: Automation) {
    setEditingAuto({ ...a });
    setIsModalOpen(true);
  }

  function toggleAction(actionId: string) {
    setEditingAuto(prev => {
      const actions = prev.actions || [];
      if (actions.includes(actionId)) {
        return { ...prev, actions: actions.filter(a => a !== actionId) };
      } else {
        return { ...prev, actions: [...actions, actionId] };
      }
    });
  }

  if (role === "product_owner") return null;

  return (
    <div className="bb-glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="bb-display text-lg font-medium text-white">Workflow Automations Hub</h2>
        <button
          onClick={openNewModal}
          className="bg-white/10 hover:bg-white/15 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> New
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-white/50" />
        </div>
      ) : automations.length === 0 ? (
        <div className="text-center py-6 text-white/50 text-sm">
          No automations configured. Create one to streamline your workflow!
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((auto) => {
            const triggerLabel = availableTriggers.find((t) => t.id === auto.trigger)?.label || auto.trigger;
            const actionLabels = auto.actions.map(aId => AVAILABLE_ACTIONS.find(a => a.id === aId)?.label || aId);

            return (
              <div
                key={auto._id}
                className={`flex items-center justify-between rounded-xl bg-white/3 border border-white/5 p-4 transition ${auto.isActive ? "" : "opacity-60"}`}
              >
                <div>
                  <span className="text-xs font-semibold text-white">{auto.name}</span>
                  <div className="text-[10px] text-white/40 mt-1 leading-relaxed max-w-[200px] sm:max-w-xs truncate">
                    Trigger: <span className="text-purple-300 font-semibold">{triggerLabel}</span>
                    <br />
                    Actions: {actionLabels.join(" → ")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEditModal(auto)} className="text-white/40 hover:text-white transition">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteAutomation(auto._id)} className="text-white/40 hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                  <button
                    disabled={savingId === auto._id}
                    onClick={() => toggleStatus(auto._id, auto.isActive)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition ${
                      auto.isActive
                        ? "bg-purple-500/20 text-purple-200"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {savingId === auto._id ? <Loader2 size={12} className="animate-spin mx-auto" /> : (auto.isActive ? "Enabled" : "Disabled")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bb-glass rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingAuto._id ? "Edit Automation" : "New Automation"}
            </h3>
            
            <form onSubmit={saveModalAutomation} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/60">Automation Name</label>
                <input
                  required
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  placeholder="e.g. Onboard New Hire"
                  value={editingAuto.name || ""}
                  onChange={(e) => setEditingAuto({ ...editingAuto, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/60">When this happens (Trigger)</label>
                <select
                  required
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm appearance-none"
                  value={editingAuto.trigger || ""}
                  onChange={(e) => setEditingAuto({ ...editingAuto, trigger: e.target.value })}
                >
                  {availableTriggers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/60">Do these things (Actions)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {AVAILABLE_ACTIONS.map((action) => {
                    const isSelected = (editingAuto.actions || []).includes(action.id);
                    return (
                      <label
                        key={action.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          isSelected ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-transparent hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => toggleAction(action.id)}
                        />
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${isSelected ? "bg-purple-500 border-purple-500" : "border-white/20"}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className="text-sm font-medium text-white/90">{action.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || !(editingAuto.actions || []).length}
                  className="flex-1 bb-btn-primary rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                >
                  {modalLoading && <Loader2 size={16} className="animate-spin" />}
                  Save Automation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
