import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";

export async function PUT(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return jsonError("Current and new passwords are required");
    }

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    if (user.authProvider !== "email") {
      return jsonError("Cannot change password for social login accounts");
    }

    const valid = await bcrypt.compare(currentPassword, user.password ?? "");
    if (!valid) return jsonError("Current password is incorrect", 400);

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
