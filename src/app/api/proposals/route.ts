import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { proposalSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Proposal from "@/models/Proposal";
import Campaign from "@/models/Campaign";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const proposals = await Proposal.find({ freelancerId: result.auth.userId })
      .sort({ createdAt: -1 })
      .populate("campaignId", "title description status");

    return NextResponse.json({ proposals });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(proposalSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const campaign = await Campaign.findById(parsed.data!.campaignId);
    if (!campaign) return jsonError("Campaign not found", 404);

    const existing = await Proposal.findOne({
      freelancerId: result.auth.userId,
      campaignId: parsed.data!.campaignId,
    });
    if (existing) return jsonError("Proposal already sent", 409);

    const proposal = await Proposal.create({
      freelancerId: result.auth.userId,
      campaignId: parsed.data!.campaignId,
      message: parsed.data!.message,
      rate: parsed.data!.rate,
    });

    await createNotification(
      campaign.ownerId.toString(),
      "proposal",
      "New proposal received",
      "A freelancer submitted a proposal for your campaign.",
    );

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
