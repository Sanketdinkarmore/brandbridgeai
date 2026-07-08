import { Package, Search, Megaphone, Sparkles, FileText, CheckSquare, Folder } from "lucide-react";
import Link from "next/link";

interface QuickActionsWidgetProps {
  onOpenReports: () => void;
  onOpenTasks: () => void;
  onOpenDocuments: () => void;
}

export default function QuickActionsWidget({
  onOpenReports,
  onOpenTasks,
  onOpenDocuments,
}: QuickActionsWidgetProps) {
  const actions = [
    { label: "New Product", icon: Package, href: "/dashboard/product_owner/products?new=true" },
    { label: "Find Brands", icon: Search, href: "/dashboard/product_owner/brands" },
    { label: "New Campaign", icon: Megaphone, href: "/dashboard/product_owner/campaigns?new=true" },
    { label: "AI Hub Consultant", icon: Sparkles, href: "/dashboard/product_owner/ai-hub" },
  ];

  return (
    <div className="bb-glass rounded-2xl p-6">
      <h3 className="bb-display mb-4 text-base font-semibold text-white">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act) => (
          <Link
            key={act.label}
            href={act.href}
            className="flex flex-col items-center justify-center rounded-xl bg-white/3 p-4 text-center text-sm font-medium text-white/80 transition hover:bg-purple-500/10 hover:text-purple-200"
          >
            <act.icon size={20} className="mb-2 text-purple-400" />
            {act.label}
          </Link>
        ))}
        <button
          onClick={onOpenReports}
          className="flex flex-col items-center justify-center rounded-xl bg-white/3 p-4 text-center text-sm font-medium text-white/80 transition hover:bg-purple-500/10 hover:text-purple-200 cursor-pointer"
        >
          <FileText size={20} className="mb-2 text-purple-400" />
          Reports Center
        </button>
        <button
          onClick={onOpenTasks}
          className="flex flex-col items-center justify-center rounded-xl bg-white/3 p-4 text-center text-sm font-medium text-white/80 transition hover:bg-purple-500/10 hover:text-purple-200 cursor-pointer"
        >
          <CheckSquare size={20} className="mb-2 text-purple-400" />
          Task Center
        </button>
        <button
          onClick={onOpenDocuments}
          className="flex flex-col items-center justify-center rounded-xl bg-white/3 p-4 text-center text-sm font-medium text-white/80 transition hover:bg-purple-500/10 hover:text-purple-200 cursor-pointer col-span-2"
        >
          <Folder size={20} className="mb-2 text-purple-400" />
          Document Center
        </button>
      </div>
    </div>
  );
}
