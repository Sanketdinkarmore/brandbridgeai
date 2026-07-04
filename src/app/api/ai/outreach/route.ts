import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import { connectDB } from "@/lib/mongodb";
import { generateText } from "@/lib/gemini";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const uid = new Types.ObjectId(authResult.auth.userId);
    const myProfile = await Profile.findOne({ userId: uid });

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const { targetBrandName } = await req.json();

    if (!targetBrandName) {
      return NextResponse.json({ error: "Target brand name is required" }, { status: 400 });
    }

    const prompt = `You are an expert partnership manager writing a cold outreach email.
Write a compelling, professional, yet approachable cold email proposing a co-marketing collaboration.
Do not include any placeholders like [Your Name] unless absolutely necessary; use the information provided.

Sender's Company: ${myProfile.companyName || "Our Brand"}
Sender's Industry: ${myProfile.industry || "N/A"}
Sender's Value Proposition / Bio: ${myProfile.bio || "N/A"}

Recipient's Company: ${targetBrandName}

The email should:
1. Have a catchy subject line (starting with "Subject: ")
2. Compliment the recipient's brand briefly.
3. Introduce the sender's brand and the potential synergy.
4. Propose a high-level collaboration idea (e.g., co-branded content, cross-promotion).
5. End with a soft call to action to chat further.
`;

    const emailDraft = await generateText(prompt);

    return NextResponse.json({ emailDraft });
  } catch (error: any) {
    console.error("Outreach API error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate outreach email" }, { status: 500 });
  }
}
