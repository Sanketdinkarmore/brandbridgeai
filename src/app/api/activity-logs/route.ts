import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import ActivityLog from "@/models/ActivityLog";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const logs = await ActivityLog.find({ userId: result.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
