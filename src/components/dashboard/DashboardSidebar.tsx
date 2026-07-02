"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogOut, X } from "lucide-react";
import {
  getRoleNavItems,
  getDashboardPath,
  ROLE_LABELS,
  type UserRole,
} from "@/lib/roles";

interface UserData {
  name: string;
  email: string;
  role?: UserRole;
}

interface DashboardSidebarProps {
  user: UserData | null;
  sidebarOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function DashboardSidebar({
  user,
  sidebarOpen,
  onClose,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const role = user?.role;
  const navItems = role ? getRoleNavItems(role) : [];

  function isActive(href: string) {
    if (href === getDashboardPath(role!)) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`bb-glass fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between p-5">
        <Link
          href={role ? getDashboardPath(role) : "/dashboard"}
          className="bb-display flex items-center gap-2 text-lg font-semibold"
          onClick={onClose}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#4f8cff)" }}
          >
            <Sparkles size={16} className="text-white" />
          </span>
          <span className="bb-grad-text">BrandBridge</span>
        </Link>
        <button onClick={onClose} className="text-white/60 lg:hidden">
          <X size={20} />
        </button>
      </div>

      {role && (
        <div className="mx-3 mb-3 rounded-xl bg-purple-500/10 px-3 py-2 text-xs text-purple-300">
          {ROLE_LABELS[role]} Portal
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
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
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
