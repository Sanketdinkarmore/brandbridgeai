"use client";

import { LogOut, Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccountSection from "@/components/dashboard/settings/AccountSection";
import ChangePasswordSection from "@/components/dashboard/settings/ChangePasswordSection";
import { BillingSection, ApiKeysSection } from "@/components/dashboard/settings/LockedSections";
import AutomationsSection from "@/components/dashboard/settings/AutomationsSection";
import SecuritySection from "@/components/dashboard/settings/SecuritySection";
import NotificationsSection from "@/components/dashboard/settings/NotificationsSection";
import DeleteAccountSection from "@/components/dashboard/settings/DeleteAccountSection";

interface SettingsPageProps {
  role: UserRole;
}

export default function SettingsPage({ role }: SettingsPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-white/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-white/50 py-12">Failed to load settings</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="bb-display text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your account preferences, security, and automations.</p>
      </div>

      <AccountSection initialName={user.name} initialEmail={user.email} pendingEmail={user.pendingEmail} />
      
      <ChangePasswordSection isEmailProvider={user.authProvider === "email"} />
      
      <BillingSection />
      
      <ApiKeysSection role={role} />
      
      <AutomationsSection role={role} />
      
      <NotificationsSection initialPreferences={user.notificationPreferences} />
      
      <SecuritySection is2faEnabled={user.twoFactorEnabled} />
      
      <DeleteAccountSection userEmail={user.email} isEmailProvider={user.authProvider === "email"} />

      <button
        onClick={handleLogout}
        className="w-full bb-glass rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition font-medium"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
}
