"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection({ userEmail, isEmailProvider }: { userEmail: string; isEmailProvider: boolean }) {
  const [mode, setMode] = useState<"none" | "deactivate" | "delete">("none");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, password, confirmation: confirmText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Redirect to home after successful deactivation/deletion
      router.push("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="bb-glass rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
      <h2 className="bb-display text-lg font-medium text-red-400 flex items-center gap-2">
        <AlertTriangle size={18} />
        Danger Zone
      </h2>
      <p className="text-sm text-white/50 mt-1 mb-6">These actions are permanent or require admin assistance to reverse.</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setMode("deactivate")}
          className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-medium transition text-left"
        >
          <span className="block text-white font-semibold mb-1">Deactivate Account</span>
          <span className="block text-xs text-white/50 font-normal">Hides your profile and logs you out everywhere. You can reactivate by logging in.</span>
        </button>
        <button
          onClick={() => setMode("delete")}
          className="flex-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-3 text-sm font-medium transition text-left"
        >
          <span className="block font-semibold mb-1">Delete Account</span>
          <span className="block text-xs text-red-400/60 font-normal">Permanently erases all your data. This cannot be undone.</span>
        </button>
      </div>

      {mode !== "none" && (
        <div className="mt-6 border-t border-red-500/20 pt-6">
          <h3 className="text-base font-medium text-white mb-2">
            Confirm {mode === "delete" ? "Deletion" : "Deactivation"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isEmailProvider && mode === "delete" && (
              <div>
                <label className="mb-1 block text-xs text-white/50">Current Password</label>
                <input
                  type="password"
                  required
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            
            {mode === "delete" && (
              <div>
                <label className="mb-1 block text-xs text-white/50">Type <span className="font-mono text-red-400">DELETE</span> to confirm</label>
                <input
                  required
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm font-mono"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setMode("none"); setError(""); setPassword(""); setConfirmText(""); }}
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (mode === "delete" && confirmText !== "DELETE")}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Yes, {mode} my account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
