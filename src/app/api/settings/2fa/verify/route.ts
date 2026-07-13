import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { code, action, password } = await request.json();

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    if (action === "disable") {
      if (!user.twoFactorEnabled) return jsonError("2FA is not enabled");
      
      if (user.authProvider === "email") {
        if (!password) return jsonError("Password required to disable 2FA");
        const valid = await bcrypt.compare(password, user.password ?? "");
        if (!valid) return jsonError("Incorrect password", 401);
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();
      return NextResponse.json({ message: "2FA disabled successfully" });
    }

    // Action = enable
    if (!code) return jsonError("Verification code required");
    if (!user.twoFactorSecret) return jsonError("Please generate a 2FA secret first");

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1 // allow 30s drift
    });
    if (!isValid) return jsonError("Invalid code", 400);

    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({ message: "2FA enabled successfully" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
