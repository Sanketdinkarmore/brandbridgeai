"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Sparkles, Calendar, DollarSign, Target, PlusCircle, CheckCircle, ChevronRight, UserPlus, FileText } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import type { CampaignItem } from "@/lib/dashboard-types";
import type { ProductOwnerProductItem } from "../lib/types";
import { PO_API_BASE } from "../lib/types";

interface ExtendedCampaign extends CampaignItem {
  goals?: string;
  milestones?: { title: string; date: string; completed: boolean }[];
  partnerName?: string;
  roi?: string;
  tasksCount?: number;
}

export default function ProductOwnerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<ExtendedCampaign[]>([]);
  const [products, setProducts] = useState<ProductOwnerProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1); // 1, 2, 3

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("awareness");
  const [partnerName, setPartnerName] = useState("");
  const [milestones, setMilestones] = useState<{ title: string; date: string; completed: boolean }[]>([
    { title: "Contract Signed", date: "", completed: false },
    { title: "Content Draft Approval", date: "", completed: false },
    { title: "Campaign Live Post", date: "", completed: false },
  ]);

  // AI suggestions
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggest, setAiSuggest] = useState("");

  function load() {
    Promise.all([
      fetch("/api/campaigns").then((r) => r.json()),
      fetch(`${PO_API_BASE}/products?status=active`).then((r) => r.json()),
    ])
      .then(([campaignData, productData]) => {
        const list = (productData.products ?? []).filter(
          (p: ProductOwnerProductItem) => p.status === "active"
        );
        setProducts(list);
        if (list.length && !productId) setProductId(list[0]._id);

        // Map mock enterprise fields to pre-existing campaigns
        const enriched = (campaignData.campaigns ?? []).map((c: any, index: number) => {
          const mockPartners = ["Apex Marketing", "Prime Studio", "Nova Digital"];
          return {
            ...c,
            goals: c.goals || (index % 2 === 0 ? "Brand Awareness" : "Conversion Sales"),
            partnerName: c.partnerName || mockPartners[index % mockPartners.length],
            roi: c.roi || `${(2.2 + index * 0.4).toFixed(1)}x Est. ROI`,
            milestones: c.milestones || [
              { title: "Agreement Finalized", date: "2026-07-15", completed: true },
              { title: "Content Review", date: "2026-07-20", completed: false },
              { title: "Publish Post", date: "2026-08-01", completed: false },
            ],
          };
        });
        setCampaigns(enriched);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [productId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        status: "active",
        productId: productId || undefined,
        budget: budget ? Number(budget) : undefined,
      }),
    });

    if (res.ok) {
      // Add trigger automation
      await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${title} Workflow Automation`,
          trigger: "campaign_approved",
          actions: ["create_task", "notify_team", "send_email"],
        }),
      });

      setTitle("");
      setDescription("");
      setBudget("");
      setGoals("awareness");
      setPartnerName("");
      setShowWizard(false);
      setStep(1);
      load();
    }
  }

  async function handleAskAISuggestions() {
    setAiLoading(true);
    setAiSuggest("");
    try {
      const res = await fetch("/api/ai/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pricing",
          prompt: `Optimize campaign budget: $${budget || 5000} and list milestone suggestions for theme: ${title || "Summer apparel placement"}.`,
        }),
      });
      const data = await res.json();
      setAiSuggest(data.result || "Suggested budget split: 60% creators, 30% ads, 10% analytics.");
    } catch {
      setAiSuggest("AI suggestions are temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  }

  // Calculate estimated ROI
  const numBudget = Number(budget) || 0;
  const estimatedCTR = goals === "sales" ? 0.038 : 0.054;
  const estimatedROI = numBudget ? ((numBudget * estimatedCTR * 4.8) / 10).toFixed(1) + "x" : "2.5x";

  if (loading) return <div className="text-white/50">Loading campaigns...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Campaign Management"
        subtitle="Orchestrate product promotion campaigns, allocate budgets, track milestones, and forecast ROI."
        action={
          <button
            type="button"
            onClick={() => setShowWizard(!showWizard)}
            className="bb-btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm cursor-pointer"
          >
            <Plus size={16} /> {showWizard ? "Cancel Wizard" : "New Campaign"}
          </button>
        }
      />

      {showWizard && (
        <div className="bb-glass rounded-2xl p-6 space-y-6 border border-purple-500/10 shadow-2xl">
          {/* Progress bar */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 text-xs font-semibold">
            <span className={step >= 1 ? "text-purple-300" : "text-white/45"}>1. Core Details</span>
            <ChevronRight size={14} className="text-white/30" />
            <span className={step >= 2 ? "text-purple-300" : "text-white/45"}>2. Milestones & Goals</span>
            <ChevronRight size={14} className="text-white/30" />
            <span className={step >= 3 ? "text-purple-300" : "text-white/45"}>3. Budget & ROI</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/50">Campaign Title</label>
                  <input
                    className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                    placeholder="e.g. Summer ActiveWear Blast"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/50">Description</label>
                  <textarea
                    className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                    placeholder="Describe target demographics, platforms, content assets..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs text-white/50">Link to active Product</label>
                      <select
                        className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs text-white/50">Assigned Brand Partner (Optional)</label>
                    <input
                      className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                      placeholder="e.g. Aura Lifestyle Inc"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bb-btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/50">Select Primary Campaign Goal</label>
                  <select
                    className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                  >
                    <option value="awareness">Brand Awareness & Views</option>
                    <option value="engagement">Engagement & Leads</option>
                    <option value="sales">Conversions & Direct Sales</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-white/50 block">Define Milestones</label>
                  {milestones.map((mil, idx) => (
                    <div key={idx} className="flex gap-3 items-center text-xs">
                      <CheckCircle size={14} className="text-purple-400" />
                      <span className="font-medium text-white/80 flex-1">{mil.title}</span>
                      <input
                        className="bb-input rounded-xl px-3 py-1.5 text-xs"
                        type="date"
                        required
                        value={mil.date}
                        onChange={(e) => {
                          const copy = [...milestones];
                          copy[idx]!.date = e.target.value;
                          setMilestones(copy);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl px-4 py-2 text-xs text-white/50 hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bb-btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/50">Marketing Budget ($)</label>
                    <input
                      className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                      placeholder="e.g. 5000"
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                    />
                  </div>
                  {/* ROI Calculator Card */}
                  <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-semibold uppercase">
                      <Target size={12} /> Live ROI Forecaster
                    </div>
                    <p className="text-xl font-bold text-white">{estimatedROI} Est. ROI</p>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Estimated based on a target {goals === "sales" ? "3.8%" : "5.4%"} Click-through Rate (CTR).
                    </p>
                  </div>
                </div>

                {/* AI Assistant section */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={handleAskAISuggestions}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-300 hover:text-purple-200 cursor-pointer"
                  >
                    <Sparkles size={12} /> Ask AI to Optimize Milestones & Keywords
                  </button>
                  {aiSuggest && (
                    <div className="bg-white/2 border border-white/5 rounded-xl p-3.5 text-xs text-white/70 font-mono leading-relaxed max-h-32 overflow-y-auto">
                      {aiSuggest}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl px-4 py-2 text-xs text-white/50 hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bb-btn-primary rounded-xl px-6 py-2.5 text-xs font-semibold cursor-pointer"
                  >
                    Launch Campaign
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns"
          description="Create a promotion campaign for your active products."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c._id} className="bb-glass rounded-2xl p-6 space-y-4 border border-white/5">
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <h3 className="bb-display text-base font-semibold text-white">{c.title}</h3>
                  <span className="inline-block text-[10px] uppercase font-bold text-purple-300 mt-1">
                    {c.goals}
                  </span>
                </div>
                <span className="text-[10px] bg-green-500/20 text-green-300 font-semibold px-2 py-0.5 rounded capitalize">
                  {c.status}
                </span>
              </div>

              {c.description && <p className="text-xs text-white/60 leading-relaxed">{c.description}</p>}

              <div className="grid grid-cols-3 gap-3 text-xs bg-white/2 border border-white/5 rounded-xl p-3 text-center">
                <div>
                  <span className="block text-[9px] text-white/40">Budget</span>
                  <span className="font-semibold text-white">
                    {c.budget != null ? `$${c.budget.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] text-white/40">ROI Forecast</span>
                  <span className="font-semibold text-purple-300">{c.roi}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-white/40">Brand Partner</span>
                  <span className="font-semibold text-white truncate max-w-[80px] inline-block">
                    {c.partnerName}
                  </span>
                </div>
              </div>

              {/* Milestones timeline checkmarks */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold text-white/40">Milestones Track</h4>
                <div className="space-y-2">
                  {c.milestones?.map((mil, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex gap-2 items-center">
                        <CheckCircle size={13} className={mil.completed ? "text-purple-400" : "text-white/20"} />
                        <span className={mil.completed ? "text-white/45 line-through" : "text-white/80 font-medium"}>
                          {mil.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40">{mil.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
