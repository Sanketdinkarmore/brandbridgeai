import type { ProductOwnerStatus } from "../_models/ProductOwnerProduct";
export type { ProductOwnerStatus };

export interface PerformanceDay {
  date: string;
  views: number;
  collaborationRequests: number;
}

export interface ProductAnalytics {
  views: number;
  collaborationRequests: number;
  performanceHistory: PerformanceDay[];
}

export interface ProductOwnerProductItem {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  targetAudience?: string;
  status: ProductOwnerStatus;
  collaborationGoals?: string;
  marketingBudget?: number;
  analytics?: ProductAnalytics;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStatItem {
  label: string;
  value: string;
}

export interface DashboardPanelItem {
  title: string;
  items: Record<string, unknown>[];
}

export interface CollaborationRequestItem {
  _id: string;
  status: string;
  message?: string;
  proposal?: string;
  compatibilityScore?: number;
  productId?: { _id: string; name: string };
  partnerId: { _id: string; name: string };
  createdAt?: string;
}

export interface ProductSearchFilters {
  q?: string;
  category?: string;
  status?: ProductOwnerStatus;
  tags?: string;
  minBudget?: string;
  maxBudget?: string;
}

export interface ProductMeta {
  categories: string[];
  tags: string[];
  statuses: ProductOwnerStatus[];
}

export const PO_API_BASE = "/dashboard/product_owner/api";
