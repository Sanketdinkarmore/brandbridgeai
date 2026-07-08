import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import User from "@/models/User";
import type { IProductOwnerProduct } from "../_models/ProductOwnerProduct";

export async function requireProductOwnerAuth(): Promise<
  { auth: { userId: string; email: string } } | { error: NextResponse }
> {
  const result = await requireAuth();
  if ("error" in result) return result;

  await connectDB();
  const user = await User.findById(result.auth.userId).select("role");
  if (user?.role !== "product_owner") {
    return { error: jsonError("Forbidden", 403) };
  }

  return { auth: result.auth };
}

export function recordAnalyticsEvent(
  product: IProductOwnerProduct,
  field: "views" | "collaborationRequests",
) {
  const today = new Date().toISOString().slice(0, 10);
  product.analytics[field] += 1;

  const history = product.analytics.performanceHistory ?? [];
  const existing = history.find((entry) => entry.date === today);

  if (existing) {
    existing[field] += 1;
  } else {
    history.push({
      date: today,
      views: field === "views" ? 1 : 0,
      collaborationRequests: field === "collaborationRequests" ? 1 : 0,
    });
  }

  product.analytics.performanceHistory = history.slice(-30);
}

export { jsonError, parseBody };
