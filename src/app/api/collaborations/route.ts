import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { collaborationSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Collaboration from "@/models/Collaboration";
import User from "@/models/User";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);
    const collaborations = await Collaboration.find({
      $or: [{ initiatorId: uid }, { partnerId: uid }],
    })
      .sort({ createdAt: -1 })
      .populate("initiatorId", "name email")
      .populate("partnerId", "name email");

    return NextResponse.json({ collaborations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(collaborationSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const partner = await User.findById(parsed.data!.partnerId);
    if (!partner) return jsonError("Partner not found", 404);

    const existing = await Collaboration.findOne({
      $or: [
        { initiatorId: result.auth.userId, partnerId: parsed.data!.partnerId },
        { initiatorId: parsed.data!.partnerId, partnerId: result.auth.userId },
      ],
    });
    if (existing) return jsonError("Collaboration already exists", 409);

    const collaboration = await Collaboration.create({
      initiatorId: result.auth.userId,
      partnerId: parsed.data!.partnerId,
      message: parsed.data!.message,
      proposal: parsed.data!.proposal,
      emailDraft: parsed.data!.emailDraft,
      compatibilityScore: parsed.data!.compatibilityScore,
    });

    await createNotification(
      parsed.data!.partnerId,
      "collaboration",
      "New collaboration request",
      "You received a new collaboration request.",
      `/dashboard/${partner.role}/collaborations`,
    );

    return NextResponse.json({ collaboration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
