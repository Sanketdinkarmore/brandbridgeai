import type { LucideIcon } from "lucide-react";

interface PoStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export default function PoStatCard({ label, value, icon: Icon }: PoStatCardProps) {
  return (
    <div className="bb-glass bb-card rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 cursor-default">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: "rgba(139,92,246,0.18)" }}
      >
        <Icon size={18} className="text-purple" />
      </div>
      <div className="bb-display mt-4 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-ink-faint">{label}</div>
    </div>
  );
}
