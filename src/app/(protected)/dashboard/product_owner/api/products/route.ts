import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  requireProductOwnerAuth,
  jsonError,
  parseBody,
} from "../../lib/api-utils";
import { productOwnerProductSchema } from "../../lib/validators";
import { buildProductFilter } from "../../lib/product-query";
import ProductOwnerProduct from "../../_models/ProductOwnerProduct";
import type { ProductSearchFilters } from "../../lib/types";

function parseSearchParams(searchParams: URLSearchParams): ProductSearchFilters {
  return {
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    status: (searchParams.get("status") as ProductSearchFilters["status"]) ?? undefined,
    tags: searchParams.get("tags") ?? undefined,
    minBudget: searchParams.get("minBudget") ?? undefined,
    maxBudget: searchParams.get("maxBudget") ?? undefined,
  };
}

export async function GET(request: Request) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const filters = parseSearchParams(searchParams);
    const query = buildProductFilter(result.auth.userId, filters);

    const products = await ProductOwnerProduct.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(productOwnerProductSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const product = await ProductOwnerProduct.create({
      userId: result.auth.userId,
      ...parsed.data,
      tags: parsed.data!.tags ?? [],
      images: parsed.data!.images ?? [],
      status: parsed.data!.status ?? "draft",
      analytics: { views: 0, collaborationRequests: 0, performanceHistory: [] },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
