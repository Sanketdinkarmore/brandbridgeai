import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { productSchema } from "@/lib/validators";
import Product from "@/models/Product";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();
    const product = await Product.findOne({ _id: id, userId: result.auth.userId });
    if (!product) return jsonError("Product not found", 404);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(productSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const product = await Product.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: parsed.data },
      { returnDocument: 'after' },
    );
    if (!product) return jsonError("Product not found", 404);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();
    const product = await Product.findOneAndDelete({ _id: id, userId: result.auth.userId });
    if (!product) return jsonError("Product not found", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
