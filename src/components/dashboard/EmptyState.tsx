import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bb-glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(139,92,246,0.15)" }}
      >
        <Icon size={24} className="text-purple-300" />
      </div>
      <h3 className="bb-display text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-white/45">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
