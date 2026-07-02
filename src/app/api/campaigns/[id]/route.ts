import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { campaignSchema } from "@/lib/validators";
import Campaign from "@/models/Campaign";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    await connectDB();
    const campaign = await Campaign.findById(id).populate("ownerId", "name");
    if (!campaign) return jsonError("Campaign not found", 404);
    return NextResponse.json({ campaign });
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
    const parsed = parseBody(campaignSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, ownerId: result.auth.userId },
      { $set: parsed.data },
      { new: true },
    );
    if (!campaign) return jsonError("Campaign not found", 404);
    return NextResponse.json({ campaign });
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
    const campaign = await Campaign.findOneAndDelete({ _id: id, ownerId: result.auth.userId });
    if (!campaign) return jsonError("Campaign not found", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
