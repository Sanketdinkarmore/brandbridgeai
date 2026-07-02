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

        {message && <p className="text-sm text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bb-btn-primary flex items-center gap-2 rounded-xl px-6 py-3 text-sm"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save Settings
        </button>
      </form>
    </div>
  );
}
