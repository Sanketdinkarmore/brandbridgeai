import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { settingsSchema } from "@/lib/validators";
import User from "@/models/User";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const user = await User.findById(result.auth.userId).select("-password -otp -resetToken");
    if (!user) return jsonError("User not found", 404);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(settingsSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    if (parsed.data!.name) user.name = parsed.data!.name;

    if (parsed.data!.newPassword) {
      if (!parsed.data!.currentPassword) {
        return jsonError("Current password required");
      }
      if (user.authProvider === "email") {
        const valid = await bcrypt.compare(parsed.data!.currentPassword, user.password ?? "");
        if (!valid) return jsonError("Current password is incorrect", 401);
        user.password = await bcrypt.hash(parsed.data!.newPassword, 12);
      }
    }

    await user.save();
    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
