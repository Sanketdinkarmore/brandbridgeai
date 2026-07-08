import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireProductOwnerAuth, jsonError } from "../../../../lib/api-utils";
import ProductOwnerProduct from "../../../../_models/ProductOwnerProduct";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();
    const product = await ProductOwnerProduct.findOne({
      _id: id,
      userId: result.auth.userId,
    }).select("analytics name status category");

    if (!product) return jsonError("Product not found", 404);

    return NextResponse.json({
      analytics: product.analytics,
      product: {
        _id: product._id,
        name: product.name,
        status: product.status,
        category: product.category,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
