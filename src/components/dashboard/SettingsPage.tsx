"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "./PageHeader";
import type { UserRole } from "@/lib/roles";

interface SettingsPageProps {
  role: UserRole;
}

export default function SettingsPage({ role }: SettingsPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setName(d.user?.name ?? "");
        setEmail(d.user?.email ?? "");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("Settings saved successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />
      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium">Account</h2>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Name</label>
            <input
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Email</label>
            <input
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm opacity-60"
              value={email}
              disabled
            />
          </div>
        </div>

        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium">Change Password</h2>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Current Password</label>
            <input
              type="password"
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">New Password</label>
            <input
              type="password"
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Enterprise Billing & Subscription */}
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium text-white">Billing & Subscription</h2>
          <div className="flex justify-between items-center rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
            <div>
              <span className="text-xs text-purple-300 font-bold uppercase block">Current Tier</span>
              <span className="text-sm font-semibold text-white">Enterprise AI Plus ($249/mo)</span>
            </div>
            <span className="rounded-full bg-green-500/25 px-2.5 py-1 text-xs text-green-300 font-semibold">Active</span>
          </div>
          <div className="space-y-1.5">
            <span className="block text-xs text-white/50">Linked Payment Card</span>
            <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-xs text-white/80 flex justify-between">
              <span>•••• •••• •••• 4242 (Visa Corporate)</span>
              <span>Expires 12/28</span>
            </div>
          </div>
        </div>

        {/* API Keys & Webhooks */}
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium text-white">API Keys & Webhooks</h2>
          <div className="space-y-1.5">
            <span className="block text-xs text-white/50">Active API Token</span>
            <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-xs font-mono text-white/80 flex justify-between items-center">
              <span>bb_live_pk_f8934ha89f7fhq93f...</span>
              <button
                type="button"
                onClick={() => alert("Copied API Key to clipboard")}
                className="text-purple-300 hover:underline cursor-pointer"
              >
                Copy Key
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs text-white/50">Webhook Endpoint URL</label>
            <input
              className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
              placeholder="https://yourdomain.com/webhooks/brandbridge"
              defaultValue="https://api.brandbridgeai.com/v1/webhook"
            />
          </div>
        </div>

        {/* Workflow Automations Hub */}
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium text-white">Workflow Automations Hub</h2>
          <div className="space-y-3">
            {[
              {
                id: "1",
                name: "Campaign Approved Workflow",
                trigger: "Campaign approved",
                actions: ["Create tasks", "Notify team", "Generate report", "Send email"],
                active: true,
              },
              {
                id: "2",
                name: "Outreach Accepted Setup",
                trigger: "Collaboration accepted",
                actions: ["Schedule sync meeting", "Notify stakeholders"],
                active: false,
              },
            ].map((auto) => (
              <div
                key={auto.id}
                className="flex items-center justify-between rounded-xl bg-white/3 border border-white/5 p-4"
              >
                <div>
                  <span className="text-xs font-semibold text-white">{auto.name}</span>
                  <div className="text-[10px] text-white/40 mt-1 leading-relaxed">
                    Trigger: <span className="text-purple-300 font-semibold">{auto.trigger}</span>
                    <br />
                    Actions: {auto.actions.join(" → ")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Automation toggle action saved.`)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold cursor-pointer ${
                    auto.active
                      ? "bg-purple-500/20 text-purple-200"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {auto.active ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2FA & Privacy */}
        <div className="bb-glass rounded-2xl p-6 space-y-4">
          <h2 className="bb-display text-lg font-medium text-white">Security & 2-Factor Authentication</h2>
          <div className="flex justify-between items-center text-xs text-white/80">
            <div>
              <span className="font-semibold block">Enable 2-Factor Authentication (2FA)</span>
              <span className="text-white/40">Secure your corporate login with TOTP Google Authenticator.</span>
            </div>
            <button
              type="button"
              onClick={() => alert("2FA Setup Dialog initialized.")}
              className="bg-purple-500/20 text-purple-200 border border-purple-500/25 px-3 py-1.5 rounded-xl font-semibold cursor-pointer"
            >
              Setup 2FA
            </button>
          </div>
          <div className="border-t border-white/5 pt-4 space-y-2">
            <span className="block text-xs text-white/45 uppercase font-bold">Active Device Sessions</span>
            <div className="text-[11px] text-white/60 space-y-1">
              <p>• Chrome on Windows (Current session) - Mumbai, India</p>
              <p className="opacity-50">• Safari on iOS iPhone 14 - Pune, India</p>
            </div>
          </div>
        </div>

        {message && <p className="text-sm text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bb-btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm cursor-pointer"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save Settings
        </button>
      </form>
    </div>
  );
}
