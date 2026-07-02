"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  getDashboardPath,
  isValidRole,
  type UserRole,
} from "@/lib/roles";

interface UserData {
  name: string;
  email: string;
  role?: UserRole;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }),
      fetch("/api/profile", { credentials: "include" }),
    ])
      .then(async ([authRes, profileRes]) => {
        if (!authRes.ok) throw new Error("Unauthorized");
        const authData = await authRes.json();
        setUser(authData.user);

        if (!authData.user.role) {
          router.replace("/signup");
          return;
        }

        const role = authData.user.role as UserRole;
        const roleFromPath = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const complete = profileData.profile?.profileComplete ?? false;
          setProfileComplete(complete);

          if (!complete && !pathname.startsWith("/onboarding")) {
            router.replace("/onboarding/profile");
            return;
          }
        }

        if (pathname === "/dashboard") {
          router.replace(getDashboardPath(role));
          return;
        }

        if (roleFromPath && isValidRole(roleFromPath) && roleFromPath !== role) {
          router.replace(getDashboardPath(role));
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setAuthChecked(true));
  }, [router, pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  if (!authChecked) {
    return (
      <div className="bb-page flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  if (pathname.startsWith("/onboarding")) {
    return <div className="bb-page min-h-screen">{children}</div>;
  }

  return (
    <div className="bb-page flex min-h-screen">
      <DashboardSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <DashboardHeader role={user?.role} onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
