"use client";

import { Lock } from "lucide-react";
import type { UserRole } from "@/lib/roles";

export function BillingSection() {
  return (
    <div className="bb-glass rounded-2xl p-6 space-y-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Lock size={14} className="text-white/60" />
          <span className="text-xs font-medium text-white">Coming Soon</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center opacity-50 select-none pointer-events-none">
        <h2 className="bb-display text-lg font-medium text-white">Billing & Subscription</h2>
        <span className="text-xs text-white/40">Available in a future update</span>
      </div>
      
      <div className="opacity-50 select-none pointer-events-none space-y-4">
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
    </div>
  );
}

export function ApiKeysSection({ role }: { role: UserRole }) {
  if (role === "product_owner") return null;

  return (
    <div className="bb-glass rounded-2xl p-6 space-y-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Lock size={14} className="text-white/60" />
          <span className="text-xs font-medium text-white">Coming Soon</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center opacity-50 select-none pointer-events-none">
        <h2 className="bb-display text-lg font-medium text-white">API Keys & Webhooks</h2>
        <span className="text-xs text-white/40">API access coming soon</span>
      </div>
      
      <div className="opacity-50 select-none pointer-events-none space-y-4">
        <div className="space-y-1.5">
          <span className="block text-xs text-white/50">Active API Token</span>
          <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 text-xs font-mono text-white/80 flex justify-between items-center">
            <span>bb_live_pk_f8934ha89f7fhq93f...</span>
            <button className="text-purple-300 hover:underline">Copy Key</button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs text-white/50">Webhook Endpoint URL</label>
          <input
            readOnly
            className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
            value="https://api.brandbridgeai.com/v1/webhook"
          />
        </div>
      </div>
    </div>
  );
}
