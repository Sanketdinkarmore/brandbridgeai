import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { campaignSchema } from "@/lib/validators";
import Campaign from "@/models/Campaign";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const open = searchParams.get("open");

    await connectDB();
    const filter: Record<string, unknown> = {};

    if (open === "true") {
      filter.status = "active";
    } else {
      filter.ownerId = result.auth.userId;
      if (status) filter.status = status;
    }

    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .populate("ownerId", "name");

    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(campaignSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const campaign = await Campaign.create({
      ownerId: result.auth.userId,
      title: parsed.data!.title,
      description: parsed.data!.description,
      status: parsed.data!.status ?? "draft",
      participants: parsed.data!.participants ?? [],
      budget: parsed.data!.budget,
      collaborationId: parsed.data!.collaborationId,
      productId: parsed.data!.productId,
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
