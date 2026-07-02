import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { portfolioItemSchema } from "@/lib/validators";
import PortfolioItem from "@/models/PortfolioItem";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const items = await PortfolioItem.find({ userId: result.auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(portfolioItemSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const item = await PortfolioItem.create({
      userId: result.auth.userId,
      ...parsed.data,
      tags: parsed.data!.tags ?? [],
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
