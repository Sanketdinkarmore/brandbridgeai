import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import SavedFreelancer from "@/models/SavedFreelancer";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const saved = await SavedFreelancer.find({ userId: result.auth.userId })
      .populate("freelancerId", "name email");
    return NextResponse.json({ saved });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { freelancerId } = await request.json();
    if (!freelancerId) return jsonError("freelancerId required");

    await connectDB();
    const saved = await SavedFreelancer.findOneAndUpdate(
      { userId: result.auth.userId, freelancerId },
      { userId: result.auth.userId, freelancerId },
      { upsert: true, new: true },
    );
    return NextResponse.json({ saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get("freelancerId");
    if (!freelancerId) return jsonError("freelancerId required");

    await connectDB();
    await SavedFreelancer.findOneAndDelete({ userId: result.auth.userId, freelancerId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
