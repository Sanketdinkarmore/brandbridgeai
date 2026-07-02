"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  Bell,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import {
  getRoleNavItems,
  getDashboardPath,
  ROLE_LABELS,
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
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);

        if (!data.user.role) {
          router.replace("/signup");
          return;
        }

        const role = data.user.role as UserRole;
        const roleFromPath = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];

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

  const role = user?.role;
  const navItems = role ? getRoleNavItems(role) : [];

  if (!authChecked) {
    return (
      <div className="bb-page flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  return (
    <div className="bb-page flex min-h-screen">
      <aside
        className={`bb-glass fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-5">
          <Link
            href={role ? getDashboardPath(role) : "/dashboard"}
            className="bb-display flex items-center gap-2 text-lg font-semibold"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
            >
              <Sparkles size={16} className="text-white" />
            </span>
            <span className="bb-grad-text">BrandBridge</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {role && (
          <div className="mx-3 mb-3 rounded-xl bg-purple-500/10 px-3 py-2 text-xs text-purple-300">
            {ROLE_LABELS[role]} Portal
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-purple-500/15 text-purple-200" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          {user && (
            <div className="mb-3 px-2">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-white/45">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="bb-glass flex items-center justify-between border-b border-white/10 px-5 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white/60 lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <button className="relative rounded-xl p-2 text-white/60 hover:bg-white/5 hover:text-white">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-purple-500" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
