"use client";

import { ROLE_OPTIONS, type UserRole } from "@/lib/roles";

interface RoleSelectorProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
  error?: string;
}

export default function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-white/70">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-2">
        {ROLE_OPTIONS.map((role) => {
          const selected = value === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <div
                className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background: selected
                    ? "linear-gradient(135deg,#8b5cf6,#4f8cff)"
                    : "rgba(139,92,246,0.18)",
                }}
              >
                <role.icon
                  size={16}
                  className={selected ? "text-white" : "text-purple-200"}
                />
              </div>
              <div className="bb-display text-xs font-medium">{role.title}</div>
              <div className="mt-0.5 text-[10px] leading-tight text-white/40">
                {role.desc}
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
