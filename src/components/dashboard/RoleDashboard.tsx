"use client";

import { useEffect, useState } from "react";
import {
  getRoleDashboardConfig,
  ROLE_LABELS,
  type UserRole,
  isValidRole,
} from "@/lib/roles";

interface UserData {
  name: string;
  role?: UserRole;
}

interface RoleDashboardProps {
  role: UserRole;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const config = getRoleDashboardConfig(role);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          {ROLE_LABELS[role]} Dashboard
        </div>
        <h1 className="bb-display text-2xl font-semibold sm:text-3xl">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-white/55">{config.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bb-glass bb-card rounded-2xl p-5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(139,92,246,0.18)" }}
            >
              <Icon size={18} className="text-purple-200" />
            </div>
            <div className="bb-display mt-4 text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs text-white/45">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {config.panels.map((panel) => (
          <div key={panel.title} className="bb-glass rounded-2xl p-6">
            <h2 className="bb-display text-lg font-medium">{panel.title}</h2>
            <p className="mt-4 text-sm text-white/45">{panel.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { isValidRole };
