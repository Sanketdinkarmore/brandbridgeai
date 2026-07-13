"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AccountSection({ initialName, initialEmail, pendingEmail }: { initialName: string; initialEmail: string; pendingEmail?: string }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bb-glass rounded-2xl p-6 space-y-4">
      <h2 className="bb-display text-lg font-medium">Account</h2>
      
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Name</label>
        <input
          required
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Email</label>
        <input
          type="email"
          required
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {pendingEmail && pendingEmail !== initialEmail && (
          <p className="mt-2 text-xs text-amber-400">Pending verification: {pendingEmail}</p>
        )}
      </div>

      {message && <p className="text-sm text-green-400">{message}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bb-btn-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Save Account
      </button>
    </form>
  );
}
