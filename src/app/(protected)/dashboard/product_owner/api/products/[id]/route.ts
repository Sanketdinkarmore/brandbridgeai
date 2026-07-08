import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  requireProductOwnerAuth,
  jsonError,
  parseBody,
  recordAnalyticsEvent,
} from "../../../lib/api-utils";
import { productOwnerProductSchema } from "../../../lib/validators";
import ProductOwnerProduct from "../../../_models/ProductOwnerProduct";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();
    const product = await ProductOwnerProduct.findOne({ _id: id, userId: result.auth.userId });
    if (!product) return jsonError("Product not found", 404);

    recordAnalyticsEvent(product, "views");
    await product.save();

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(productOwnerProductSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const product = await ProductOwnerProduct.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: parsed.data },
      { new: true },
    );
    if (!product) return jsonError("Product not found", 404);

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();
    const product = await ProductOwnerProduct.findOneAndDelete({
      _id: id,
      userId: result.auth.userId,
    });
    if (!product) return jsonError("Product not found", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
