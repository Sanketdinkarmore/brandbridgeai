import type { LucideIcon } from "lucide-react";

interface PoStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export default function PoStatCard({ label, value, icon: Icon }: PoStatCardProps) {
  return (
    <div className="bb-glass bb-card rounded-2xl p-5">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: "rgba(139,92,246,0.18)" }}
      >
        <Icon size={18} className="text-purple-200" />
      </div>
      <div className="bb-display mt-4 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-white/45">{label}</div>
    </div>
  );
}
