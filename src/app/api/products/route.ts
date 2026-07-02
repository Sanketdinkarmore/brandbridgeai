import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { productSchema } from "@/lib/validators";
import Product from "@/models/Product";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const products = await Product.find({ userId: result.auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(productSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const product = await Product.create({
      userId: result.auth.userId,
      ...parsed.data,
      images: parsed.data!.images ?? [],
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
