"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, ShieldAlert, FileText, Share2, DollarSign, Copy, Check } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState("consultant");
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState({ sender: "", receiver: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: "consultant", label: "AI Business Consultant", icon: MessageSquare, desc: "Ask strategy, optimization, or market questions." },
    { id: "swot", label: "AI SWOT & Risk Analysis", icon: ShieldAlert, desc: "Analyze strengths, weaknesses, opportunities, and threats." },
    { id: "proposal", label: "AI Outreach Proposal", icon: FileText, desc: "Draft high-converting brand collaboration pitches." },
    { id: "social", label: "AI Social Media Copy", icon: Share2, desc: "Generate captions, hashtags, and hooks." },
    { id: "pricing", label: "AI Pricing & ROI Matrix", icon: DollarSign, desc: "Suggest placement rates and ROI estimations." },
  ];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          prompt,
          data: activeTab === "proposal" ? data : undefined,
        }),
      });

      const body = await res.json();
      if (res.ok) {
        setResult(body.result ?? "AI completed task with no output.");
      } else {
        setResult(`Error: ${body.error ?? "Failed to query AI Hub"}`);
      }
    } catch (err) {
      setResult("Unable to connect to AI Hub API. Check network or server logs.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Creative Hub"
        subtitle="Unleash AI business consultants, outreach writers, pricing models, and SWOT analyzers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult("");
                  setPrompt("");
                }}
                className={`w-full text-left rounded-2xl p-4 transition-all border cursor-pointer ${
                  active
                    ? "bg-purple-500/15 border-purple-500/30 text-purple-200 shadow-lg shadow-purple-500/5"
                    : "bb-glass border-white/5 text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-xl p-2.5 ${active ? "bg-purple-500/25 text-purple-200" : "bg-white/5 text-white/50"}`}>
                    <tab.icon size={18} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm">{tab.label}</h4>
                    <p className="text-[11px] text-white/45 mt-0.5 line-clamp-1">{tab.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Console / Result Panel */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleGenerate} className="bb-glass rounded-2xl p-6 space-y-4">
            <h3 className="bb-display text-base font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              {tabs.find((t) => t.id === activeTab)?.label} Console
            </h3>

            {activeTab === "proposal" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50">Sender Company Name</label>
                  <input
                    className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                    placeholder="e.g. Apex Health Corp"
                    value={data.sender}
                    onChange={(e) => setData({ ...data, sender: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50">Recipient Brand Partner</label>
                  <input
                    className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                    placeholder="e.g. Aura Studio"
                    value={data.receiver}
                    onChange={(e) => setData({ ...data, receiver: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-white/50">
                {activeTab === "consultant"
                  ? "What would you like to consult about?"
                  : activeTab === "swot"
                    ? "Enter product name, description, or target industry for analysis"
                    : activeTab === "proposal"
                      ? "Campaign theme, goals, or incentive details"
                      : activeTab === "social"
                        ? "What is the product name, key benefits, or style?"
                        : "Describe the campaign or product details"}
              </label>
              <textarea
                className="bb-input w-full rounded-xl px-4 py-2.5 text-xs"
                placeholder="Enter prompts, parameters, or specifications..."
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bb-btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} />
              {loading ? "AI is processing..." : "Generate AI Output"}
            </button>
          </form>

          {/* AI Result Box */}
          {(result || loading) && (
            <div className="bb-glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-xs font-semibold uppercase text-purple-300">Generated Results</h4>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-semibold text-white/50 hover:text-white cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-green-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy Output
                      </>
                    )}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center gap-2.5 text-xs text-white/50 py-10 justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  Running AI Hub models...
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-xs text-white/80 leading-relaxed font-mono bg-white/2 border border-white/5 rounded-xl p-4 overflow-x-auto max-h-[40vh]">
                  {result}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
