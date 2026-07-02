import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateOtp, signToken, setAuthCookie } from "@/lib/auth";
import { zodErrorMessage } from "@/lib/zod-utils";
import { registerSchema } from "@/lib/validators";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const { name, email: rawEmail, password, role } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: "email",
      isEmailVerified: false,
      role,
      onboardingComplete: true,
      otp: { code: otp, expiresAt: otpExpires },
    });

    try {
      await sendOtpEmail(email, otp);
    } catch {
      return NextResponse.json(
        { error: "Account created but failed to send verification email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Registration successful. Please verify your email.",
      email,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
