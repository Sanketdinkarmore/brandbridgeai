import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { zodErrorMessage } from "@/lib/zod-utils";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ "resetToken.token": token });
    if (
      !user ||
      !user.resetToken ||
      user.resetToken.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
