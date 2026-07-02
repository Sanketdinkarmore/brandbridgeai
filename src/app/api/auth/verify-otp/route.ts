import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  generateOtp,
  getPostAuthRedirect,
  signToken,
  setAuthCookie,
} from "@/lib/auth";
import { zodErrorMessage } from "@/lib/zod-utils";
import { verifyOtpSchema } from "@/lib/validators";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const { email: rawEmail, otp } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    if (
      !user.otp ||
      user.otp.code !== otp ||
      user.otp.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role ?? undefined,
    });
    const response = NextResponse.json({
      message: "Email verified successfully",
      redirect: getPostAuthRedirect(user.isEmailVerified, user.role),
    });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await sendOtpEmail(email, otp);

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
