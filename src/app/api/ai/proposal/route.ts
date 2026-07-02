import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { aiProposalSchema } from "@/lib/validators";
import { generateCollaborationProposal } from "@/lib/ai/proposals";
import Profile from "@/models/Profile";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(aiProposalSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const [myUser, myProfile, partnerProfile, partnerUser] = await Promise.all([
      User.findById(result.auth.userId),
      Profile.findOne({ userId: result.auth.userId }),
      Profile.findOne({ userId: parsed.data!.partnerId }),
      User.findById(parsed.data!.partnerId),
    ]);

    if (!myProfile || !partnerProfile || !myUser || !partnerUser) {
      return jsonError("Profile data not found", 404);
    }

    const proposal = await generateCollaborationProposal(
      {
        name: myUser.name,
        companyName: myProfile.companyName,
        industry: myProfile.industry,
        targetAudience: myProfile.targetAudience,
        marketingBudget: myProfile.marketingBudget,
        bio: myProfile.bio,
      },
      {
        name: partnerUser.name,
        companyName: partnerProfile.companyName,
        industry: partnerProfile.industry,
        targetAudience: partnerProfile.targetAudience,
        marketingBudget: partnerProfile.marketingBudget,
        bio: partnerProfile.bio,
      },
    );

    return NextResponse.json({ proposal });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
