import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";

export async function POST() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    if (user.twoFactorEnabled) {
      return jsonError("2FA is already enabled");
    }

    const secret = speakeasy.generateSecret({ name: `BrandBridge AI (${user.email})` });
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url || "");

    user.twoFactorSecret = secret.base32;
    await user.save();

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
