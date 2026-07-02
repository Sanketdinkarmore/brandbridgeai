import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateResetToken } from "@/lib/auth";
import { zodErrorMessage } from "@/lib/zod-utils";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendResetPasswordEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const token = generateResetToken();
    user.resetToken = {
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
    await user.save();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    try {
      await sendResetPasswordEmail(email, resetUrl);
    } catch {
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
