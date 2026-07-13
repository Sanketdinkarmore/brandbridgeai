"use client";

import { useState, useEffect } from "react";
import { Loader2, Monitor, Smartphone, Globe, Shield, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export default function SecuritySection({ is2faEnabled }: { is2faEnabled: boolean }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionActionLoading, setSessionActionLoading] = useState<string | null>(null);
  
  // 2FA State
  const [is2fa, setIs2fa] = useState(is2faEnabled);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying2fa, setVerifying2fa] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaPassword, setTwoFaPassword] = useState(""); // Needed to disable 2FA
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch("/api/settings/sessions");
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function revokeSession(id: string) {
    setSessionActionLoading(id);
    try {
      const res = await fetch(`/api/settings/sessions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } finally {
      setSessionActionLoading(null);
    }
  }

  async function logoutAllOther() {
    setSessionActionLoading("all");
    try {
      const res = await fetch(`/api/settings/sessions?allButCurrent=true`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.isCurrent));
      }
    } finally {
      setSessionActionLoading(null);
    }
  }

  async function generate2FA() {
    setTwoFaError("");
    try {
      const res = await fetch("/api/settings/2fa/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrCode(data.qrCode);
      setTotpSecret(data.secret);
    } catch (err) {
      setTwoFaError((err as Error).message);
    }
  }

  async function enable2FA(e: React.FormEvent) {
    e.preventDefault();
    setVerifying2fa(true);
    setTwoFaError("");
    try {
      const res = await fetch("/api/settings/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIs2fa(true);
      setQrCode(null);
      setTotpSecret(null);
      setVerifyCode("");
    } catch (err) {
      setTwoFaError((err as Error).message);
    } finally {
      setVerifying2fa(false);
    }
  }

  async function disable2FA(e: React.FormEvent) {
    e.preventDefault();
    setVerifying2fa(true);
    setTwoFaError("");
    try {
      const res = await fetch("/api/settings/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable", password: twoFaPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIs2fa(false);
      setShowDisableModal(false);
      setTwoFaPassword("");
    } catch (err) {
      setTwoFaError((err as Error).message);
    } finally {
      setVerifying2fa(false);
    }
  }

  function renderDeviceIcon(device: string) {
    const l = device.toLowerCase();
    if (l.includes("mac") || l.includes("windows") || l.includes("linux")) return <Monitor size={16} />;
    if (l.includes("ios") || l.includes("android")) return <Smartphone size={16} />;
    return <Globe size={16} />;
  }

  return (
    <div className="bb-glass rounded-2xl p-6 space-y-8">
      {/* 2FA Section */}
      <div className="space-y-4">
        <h2 className="bb-display text-lg font-medium text-white flex items-center gap-2">
          Two-Factor Authentication (2FA)
          {is2fa ? <ShieldCheck size={18} className="text-green-400" /> : <Shield size={18} className="text-white/40" />}
        </h2>
        
        {is2fa ? (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">2FA is currently enabled</p>
              <p className="text-xs text-green-400/70 mt-1">Your account has an extra layer of security.</p>
            </div>
            <button
              onClick={() => setShowDisableModal(true)}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
            >
              Disable
            </button>
          </div>
        ) : qrCode ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            <p className="text-sm text-white/80">1. Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy).</p>
            <div className="bg-white p-2 rounded-xl w-fit mx-auto">
              <Image src={qrCode} alt="2FA QR Code" width={150} height={150} />
            </div>
            <p className="text-xs text-center font-mono text-white/50">{totpSecret}</p>
            <form onSubmit={enable2FA} className="space-y-3 pt-2 border-t border-white/10">
              <p className="text-sm text-white/80">2. Enter the 6-digit code to verify and enable 2FA.</p>
              <input
                required
                maxLength={6}
                placeholder="000000"
                className="bb-input w-full rounded-xl px-4 py-2.5 text-center tracking-[0.5em] font-mono text-lg"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
              {twoFaError && <p className="text-xs text-red-400 text-center">{twoFaError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setQrCode(null)} className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-medium hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={verifying2fa || verifyCode.length !== 6} className="flex-1 bb-btn-primary flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium">
                  {verifying2fa && <Loader2 size={16} className="animate-spin" />}
                  Enable 2FA
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/90">2FA is disabled</p>
              <p className="text-xs text-white/50 mt-1 max-w-sm">Protect your account from unauthorized access by requiring a second authentication method.</p>
            </div>
            <button onClick={generate2FA} className="whitespace-nowrap bb-btn-primary rounded-lg px-4 py-2 text-xs font-semibold">
              Set up 2FA
            </button>
          </div>
        )}
      </div>

      <hr className="border-white/10" />

      {/* Active Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="bb-display text-lg font-medium text-white">Active Device Sessions</h2>
          {sessions.length > 1 && (
            <button onClick={logoutAllOther} disabled={sessionActionLoading === "all"} className="text-xs font-medium text-red-400 hover:text-red-300 transition flex items-center gap-1.5">
              {sessionActionLoading === "all" && <Loader2 size={12} className="animate-spin" />}
              Log out all other devices
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-white/50" /></div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                    {renderDeviceIcon(s.device)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{s.device} &middot; {s.browser}</span>
                      {s.isCurrent && <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Current</span>}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
                      <span>{s.location}</span>
                      <span>&bull;</span>
                      <span>Last active: {new Date(s.lastActive).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button onClick={() => revokeSession(s.id)} disabled={sessionActionLoading === s.id} className="text-xs font-medium text-white/40 hover:text-red-400 p-2 transition">
                    {sessionActionLoading === s.id ? <Loader2 size={14} className="animate-spin" /> : "Log out"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bb-glass rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Disable 2FA?</h3>
            <p className="text-xs text-white/60 mb-4">Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.</p>
            <form onSubmit={disable2FA} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/50">Confirm Password</label>
                <input
                  type="password"
                  required
                  className="bb-input w-full rounded-xl px-4 py-2.5 text-sm"
                  value={twoFaPassword}
                  onChange={(e) => setTwoFaPassword(e.target.value)}
                />
              </div>
              {twoFaError && <p className="text-xs text-red-400">{twoFaError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowDisableModal(false)} className="flex-1 rounded-xl bg-white/5 py-2 text-sm font-medium hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={verifying2fa} className="flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition">
                  {verifying2fa && <Loader2 size={16} className="animate-spin" />}
                  Disable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
