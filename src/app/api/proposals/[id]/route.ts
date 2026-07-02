import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { proposalUpdateSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Proposal from "@/models/Proposal";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(proposalUpdateSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const proposal = await Proposal.findById(id).populate("campaignId");
    if (!proposal) return jsonError("Proposal not found", 404);

    const campaign = proposal.campaignId as unknown as { ownerId?: { toString: () => string } };
    const isOwner = campaign?.ownerId?.toString() === result.auth.userId;
    const isFreelancer = proposal.freelancerId.toString() === result.auth.userId;
    if (!isOwner && !isFreelancer) return jsonError("Forbidden", 403);

    proposal.status = parsed.data!.status;
    await proposal.save();

    const notifyId = isOwner ? proposal.freelancerId.toString() : campaign.ownerId!.toString();
    await createNotification(notifyId, "proposal", "Proposal updated", `Proposal was ${parsed.data!.status}.`);

    return NextResponse.json({ proposal });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
