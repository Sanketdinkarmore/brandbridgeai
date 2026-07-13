import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const user = await User.findById(result.auth.userId).select("notificationPreferences");
    if (!user) return jsonError("User not found", 404);

    return NextResponse.json({ preferences: user.notificationPreferences });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { preferences } = await request.json();
    if (!preferences || typeof preferences !== "object") {
      return jsonError("Invalid preferences payload");
    }

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();

    return NextResponse.json({
      message: "Notification preferences updated",
      preferences: user.notificationPreferences
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
