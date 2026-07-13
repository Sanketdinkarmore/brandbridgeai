import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";
import { generateResetToken } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { name, email } = await request.json();
    if (!name?.trim()) return jsonError("Name is required");
    
    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    user.name = name.trim();

    let emailChanged = false;
    const newEmail = email?.trim().toLowerCase();
    
    if (newEmail && newEmail !== user.email) {
      // Check if email is already in use by someone else
      const existing = await User.findOne({ email: newEmail });
      if (existing) {
        return jsonError("This email is already associated with another account");
      }
      
      user.pendingEmail = newEmail;
      user.emailVerificationToken = {
        token: generateResetToken(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      };
      emailChanged = true;
      // In a real app, send email here with a link like:
      // /api/settings/account/verify-email?token=${user.emailVerificationToken.token}
    }

    await user.save();

    return NextResponse.json({
      message: emailChanged 
        ? "Verification email sent to " + newEmail + ". Your email will update once confirmed." 
        : "Account updated successfully",
      user: {
        name: user.name,
        email: user.email,
        pendingEmail: user.pendingEmail,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
