import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getPostAuthRedirect, signToken, setAuthCookie } from "@/lib/auth";
import { zodErrorMessage } from "@/lib/zod-utils";
import { loginSchema } from "@/lib/validators";
import { ROLE_LABELS } from "@/lib/roles";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: zodErrorMessage(parsed.error) },
        { status: 400 },
      );
    }

    const { email: rawEmail, password, rememberMe, role } = parsed.data;
    const email = rawEmail.toLowerCase().trim();

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email first",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 },
      );
    }

    if (!user.role) {
      return NextResponse.json(
        { error: "Account has no role assigned. Please sign up again." },
        { status: 403 },
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        {
          error: `This account is registered as ${ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}. Please select the correct role.`,
        },
        { status: 403 },
      );
    }

    const token = signToken(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role ?? undefined,
      },
      rememberMe,
    );

    const response = NextResponse.json({
      message: "Login successful",
      redirect: getPostAuthRedirect(user.isEmailVerified, user.role),
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    setAuthCookie(response, token, rememberMe);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
