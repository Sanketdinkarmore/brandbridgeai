import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireProductOwnerAuth } from "../../lib/api-utils";
import ProductOwnerProduct from "../../_models/ProductOwnerProduct";

export async function GET() {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const [categories, tags] = await Promise.all([
      ProductOwnerProduct.distinct("category", { userId: result.auth.userId }),
      ProductOwnerProduct.distinct("tags", { userId: result.auth.userId }),
    ]);

    return NextResponse.json({
      categories: categories.filter(Boolean).sort(),
      tags: tags.filter(Boolean).sort(),
      statuses: ["draft", "active", "archived"],
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
