import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import Conversation from "@/models/Conversation";
import User from "@/models/User";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);
    const conversations = await Conversation.find({ participants: uid })
      .sort({ lastMessageAt: -1 });

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.participants.find((p) => p.toString() !== result.auth.userId);
        const other = otherId ? await User.findById(otherId).select("name email role") : null;
        return { ...conv.toObject(), otherUser: other };
      }),
    );

    return NextResponse.json({ conversations: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
