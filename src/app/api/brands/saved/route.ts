import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import SavedMatch from "@/models/SavedMatch";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { targetBrandId } = await request.json();
    if (!targetBrandId) {
      return NextResponse.json({ error: "targetBrandId is required" }, { status: 400 });
    }

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);
    const targetUid = new Types.ObjectId(targetBrandId);

    const saved = await SavedMatch.findOneAndUpdate(
      { userId: uid, savedBrandId: targetUid },
      { userId: uid, savedBrandId: targetUid },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const targetBrandId = searchParams.get("targetBrandId");
    
    if (!targetBrandId) {
      return NextResponse.json({ error: "targetBrandId is required" }, { status: 400 });
    }

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);
    const targetUid = new Types.ObjectId(targetBrandId);

    await SavedMatch.deleteOne({ userId: uid, savedBrandId: targetUid });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
