import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { hireSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Hire from "@/models/Hire";
import User from "@/models/User";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const user = await User.findById(result.auth.userId);

    const filter =
      user?.role === "freelancer"
        ? { freelancerId: result.auth.userId }
        : { hirerId: result.auth.userId };

    const hires = await Hire.find(filter)
      .sort({ createdAt: -1 })
      .populate("hirerId", "name email")
      .populate("freelancerId", "name email")
      .populate("campaignId", "title");

    return NextResponse.json({ hires });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(hireSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const hire = await Hire.create({
      hirerId: result.auth.userId,
      freelancerId: parsed.data!.freelancerId,
      campaignId: parsed.data!.campaignId,
      rate: parsed.data!.rate,
      notes: parsed.data!.notes,
      status: "pending",
    });

    await createNotification(
      parsed.data!.freelancerId,
      "hire",
      "New hire request",
      "A brand wants to hire you for a project.",
      "/dashboard/freelancer/projects",
    );

    return NextResponse.json({ hire }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
