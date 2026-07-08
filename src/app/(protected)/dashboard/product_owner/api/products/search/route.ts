import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireProductOwnerAuth } from "../../../lib/api-utils";
import { buildProductFilter } from "../../../lib/product-query";
import ProductOwnerProduct from "../../../_models/ProductOwnerProduct";
import type { ProductSearchFilters } from "../../../lib/types";

export async function GET(request: Request) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const { searchParams } = new URL(request.url);

    const filters: ProductSearchFilters = {
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      status: (searchParams.get("status") as ProductSearchFilters["status"]) ?? undefined,
      tags: searchParams.get("tags") ?? undefined,
      minBudget: searchParams.get("minBudget") ?? undefined,
      maxBudget: searchParams.get("maxBudget") ?? undefined,
    };

    const query = buildProductFilter(result.auth.userId, filters);
    const [products, categories, tags] = await Promise.all([
      ProductOwnerProduct.find(query).sort({ updatedAt: -1 }),
      ProductOwnerProduct.distinct("category", { userId: result.auth.userId }),
      ProductOwnerProduct.distinct("tags", { userId: result.auth.userId }),
    ]);

    return NextResponse.json({
      products,
      meta: {
        categories: categories.filter(Boolean).sort(),
        tags: tags.filter(Boolean).sort(),
        count: products.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
