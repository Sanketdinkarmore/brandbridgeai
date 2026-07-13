"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ChangePasswordSection({ isEmailProvider }: { isEmailProvider: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isEmailProvider) {
    return (
      <div className="bb-glass rounded-2xl p-6 space-y-4">
        <h2 className="bb-display text-lg font-medium">Change Password</h2>
        <p className="text-sm text-white/50">You are logged in with Google. Password changes are not applicable.</p>
      </div>
    );
  }

  const getStrength = (pw: string) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length > 7) s += 1;
    if (/[A-Z]/.test(pw)) s += 1;
    if (/[0-9]/.test(pw)) s += 1;
    if (/[^A-Za-z0-9]/.test(pw)) s += 1;
    return s;
  };
  const strength = getStrength(newPassword);
  const strengthLabels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-red-500", "bg-amber-400", "bg-blue-400", "bg-green-500"];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (strength < 2) {
      setError("New password is too weak.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="bb-glass rounded-2xl p-6 space-y-4">
      <h2 className="bb-display text-lg font-medium">Change Password</h2>
      
      <div>
        <label className="mb-1.5 block text-xs text-white/50">Current Password</label>
        <input
          type="password"
          required
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      
      <div>
        <label className="mb-1.5 block text-xs text-white/50">New Password</label>
        <input
          type="password"
          required
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {newPassword && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 flex gap-1 h-1.5">
              {[1, 2, 3, 4].map(level => (
                <div key={level} className={`h-full flex-1 rounded-full ${strength >= level ? strengthColors[strength] : "bg-white/10"}`} />
              ))}
            </div>
            <span className={`text-[10px] font-medium uppercase ${strength > 2 ? 'text-green-400' : 'text-white/50'}`}>
              {strengthLabels[strength]}
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/50">Confirm New Password</label>
        <input
          type="password"
          required
          className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
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
        Update Password
      </button>
    </form>
  );
}
