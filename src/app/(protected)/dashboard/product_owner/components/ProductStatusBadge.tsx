import type { ProductOwnerStatus } from "../lib/types";

const statusStyles: Record<ProductOwnerStatus, string> = {
  draft: "bg-amber-500/15 text-amber-200",
  active: "bg-emerald-500/15 text-emerald-200",
  archived: "bg-white/10 text-white/50",
};

interface ProductStatusBadgeProps {
  status: ProductOwnerStatus | string;
}

export default function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const style = statusStyles[status as ProductOwnerStatus] ?? statusStyles.draft;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
