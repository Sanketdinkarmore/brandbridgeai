import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const notifications = await Notification.find({ userId: result.auth.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: result.auth.userId,
      read: false,
    });
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id, markAllRead } = await request.json();
    await connectDB();

    if (markAllRead) {
      await Notification.updateMany(
        { userId: result.auth.userId, read: false },
        { $set: { read: true } },
      );
      return NextResponse.json({ success: true });
    }

    if (!id) return jsonError("id required");
    await Notification.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: { read: true } },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
