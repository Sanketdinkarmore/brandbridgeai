"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Handshake,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/dashboard/product_owner", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/product_owner/products", icon: Package, label: "Products" },
  { href: "/dashboard/product_owner/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/product_owner/collaborations", icon: Handshake, label: "Collaborations" },
  { href: "/dashboard/product_owner/ai-hub", icon: Sparkles, label: "AI Hub" },
];

export default function ProductOwnerSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {links.map(({ href, icon: Icon, label }) => {
        const active =
          href === "/dashboard/product_owner"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${
              active
                ? "bg-purple-500/20 text-purple-200"
                : "bg-white/5 text-white/55 hover:bg-white/8 hover:text-white/80"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
