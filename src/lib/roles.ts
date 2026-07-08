import type { LucideIcon } from "lucide-react";
import {
  Users,
  Rocket,
  Palette,
  Briefcase,
  LayoutDashboard,
  User,
  Handshake,
  Sparkles,
  Store,
  Megaphone,
  MessageSquare,
  Settings,
  Search,
  Package,
  FolderOpen,
  FileText,
  DollarSign,
  UserPlus,
} from "lucide-react";

export type UserRole = "brand" | "product_owner" | "freelancer" | "hirer";

export interface RoleOption {
  id: UserRole;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  desc: string;
}

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export interface DashboardStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "brand",
    icon: Users,
    title: "Brand",
    shortTitle: "Brand",
    desc: "Collaborate with other brands",
  },
  {
    id: "product_owner",
    icon: Rocket,
    title: "Product Owner",
    shortTitle: "Product",
    desc: "Get brands to promote your product",
  },
  {
    id: "freelancer",
    icon: Palette,
    title: "Freelancer",
    shortTitle: "Freelancer",
    desc: "Offer creative services to brands",
  },
  {
    id: "hirer",
    icon: Briefcase,
    title: "Hirer",
    shortTitle: "Hirer",
    desc: "Browse and hire freelancers",
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  brand: "Brand",
  product_owner: "Product Owner",
  freelancer: "Freelancer",
  hirer: "Hirer",
};

export function getDashboardPath(role: UserRole | string | null | undefined): string {
  if (!role) return "/dashboard";
  return `/dashboard/${role}`;
}

export function getRoleNavItems(role: UserRole): NavItem[] {
  const base = [
    { href: getDashboardPath(role), icon: LayoutDashboard, label: "Dashboard" },
    { href: `/dashboard/${role}/profile`, icon: User, label: "My Profile" },
  ];

  switch (role) {
    case "brand":
      return [
        ...base,
        { href: `/dashboard/${role}/matches`, icon: Sparkles, label: "AI Brand Matching" },
        { href: `/dashboard/${role}/collaborations`, icon: Handshake, label: "Collaborations" },
        { href: `/dashboard/${role}/campaigns`, icon: Megaphone, label: "Campaigns" },
        { href: `/dashboard/${role}/marketplace`, icon: Store, label: "Hire Freelancers" },
        { href: `/dashboard/${role}/hires`, icon: Handshake, label: "My Hires" },
        { href: `/dashboard/${role}/messages`, icon: MessageSquare, label: "Messages" },
        { href: `/dashboard/${role}/settings`, icon: Settings, label: "Settings" },
      ];
    case "product_owner":
      return [
        ...base,
        { href: `/dashboard/${role}/brands`, icon: Search, label: "Find Brands" },
        { href: `/dashboard/${role}/products`, icon: Package, label: "My Products" },
        { href: `/dashboard/${role}/campaigns`, icon: Megaphone, label: "Campaigns" },
        { href: `/dashboard/${role}/messages`, icon: MessageSquare, label: "Messages" },
        { href: `/dashboard/${role}/ai-hub`, icon: Sparkles, label: "AI Hub" },
        { href: `/dashboard/${role}/settings`, icon: Settings, label: "Settings" },
      ];
    case "freelancer":
      return [
        ...base,
        { href: `/dashboard/${role}/portfolio`, icon: FolderOpen, label: "My Portfolio" },
        { href: `/dashboard/${role}/projects`, icon: Briefcase, label: "Browse Projects" },
        { href: `/dashboard/${role}/proposals`, icon: FileText, label: "Proposals" },
        { href: `/dashboard/${role}/earnings`, icon: DollarSign, label: "Earnings" },
        { href: `/dashboard/${role}/messages`, icon: MessageSquare, label: "Messages" },
        { href: `/dashboard/${role}/settings`, icon: Settings, label: "Settings" },
      ];
    case "hirer":
      return [
        ...base,
        { href: `/dashboard/${role}/freelancers`, icon: UserPlus, label: "Browse Freelancers" },
        { href: `/dashboard/${role}/hires`, icon: Handshake, label: "My Hires" },
        { href: `/dashboard/${role}/projects`, icon: Megaphone, label: "Projects" },
        { href: `/dashboard/${role}/messages`, icon: MessageSquare, label: "Messages" },
        { href: `/dashboard/${role}/settings`, icon: Settings, label: "Settings" },
      ];
  }
}

export function getRoleDashboardConfig(role: UserRole): {
  subtitle: string;
  stats: DashboardStat[];
  panels: { title: string; desc: string }[];
} {
  switch (role) {
    case "brand":
      return {
        subtitle: "Manage brand collaborations and AI-powered partner matching.",
        stats: [
          { label: "Brand Matches", value: "0", icon: Sparkles },
          { label: "Active Collaborations", value: "0", icon: Handshake },
          { label: "Campaigns", value: "0", icon: Megaphone },
          { label: "Freelancers Hired", value: "0", icon: Store },
        ],
        panels: [
          {
            title: "AI Brand Recommendations",
            desc: "Compatible brand partners will appear here based on your audience and industry.",
          },
          {
            title: "Pending Proposals",
            desc: "Collaboration requests and AI-drafted proposals you've sent or received.",
          },
        ],
      };
    case "product_owner":
      return {
        subtitle: "Promote your products through brand partnerships.",
        stats: [
          { label: "Products Listed", value: "0", icon: Package },
          { label: "Brand Interests", value: "0", icon: Search },
          { label: "Active Promotions", value: "0", icon: Megaphone },
          { label: "Messages", value: "0", icon: MessageSquare },
        ],
        panels: [
          {
            title: "Recommended Brands",
            desc: "Brands that match your product category and target audience.",
          },
          {
            title: "Promotion Requests",
            desc: "Track outreach to brands for product promotion campaigns.",
          },
        ],
      };
    case "freelancer":
      return {
        subtitle: "Showcase your work and land creative projects.",
        stats: [
          { label: "Active Projects", value: "0", icon: Briefcase },
          { label: "Proposals Sent", value: "0", icon: FileText },
          { label: "Completed Jobs", value: "0", icon: FolderOpen },
          { label: "Total Earnings", value: "$0", icon: DollarSign },
        ],
        panels: [
          {
            title: "New Project Opportunities",
            desc: "Campaigns from brands looking for your skills will show up here.",
          },
          {
            title: "Portfolio Highlights",
            desc: "Upload work samples to attract more brand collaborations.",
          },
        ],
      };
    case "hirer":
      return {
        subtitle: "Find and manage freelancers for your campaigns.",
        stats: [
          { label: "Freelancers Saved", value: "0", icon: UserPlus },
          { label: "Active Hires", value: "0", icon: Handshake },
          { label: "Open Projects", value: "0", icon: Megaphone },
          { label: "Messages", value: "0", icon: MessageSquare },
        ],
        panels: [
          {
            title: "Top Freelancers",
            desc: "Browse rated freelancers by category, portfolio, and price.",
          },
          {
            title: "Recent Hires",
            desc: "Track freelancers you've hired for ongoing campaigns.",
          },
        ],
      };
  }
}

export function isValidRole(role: string): role is UserRole {
  return ["brand", "product_owner", "freelancer", "hirer"].includes(role);
}
