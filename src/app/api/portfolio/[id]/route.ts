import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { portfolioItemSchema } from "@/lib/validators";
import PortfolioItem from "@/models/PortfolioItem";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(portfolioItemSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const item = await PortfolioItem.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: parsed.data },
      { returnDocument: 'after' },
    );
    if (!item) return jsonError("Portfolio item not found", 404);
    return NextResponse.json({ item });
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
    const item = await PortfolioItem.findOneAndDelete({ _id: id, userId: result.auth.userId });
    if (!item) return jsonError("Portfolio item not found", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
