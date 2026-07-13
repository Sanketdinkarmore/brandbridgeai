import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import User from "@/models/User";
import Profile from "@/models/Profile";
import Session from "@/models/Session";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { action, password, confirmation } = await request.json();

    if (action !== "deactivate" && action !== "delete") {
      return jsonError("Invalid action", 400);
    }

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user) return jsonError("User not found", 404);

    if (action === "delete") {
      if (user.authProvider === "email") {
        if (!password) return jsonError("Password required to delete account");
        const valid = await bcrypt.compare(password, user.password ?? "");
        if (!valid) return jsonError("Incorrect password", 401);
      }
      if (confirmation !== "DELETE" && confirmation !== user.email) {
        return jsonError("You must type DELETE or your email to confirm", 400);
      }

      // Perform deletion (or anonymization depending on privacy policy)
      // For this implementation, we delete User, Profile, and Sessions
      await Profile.deleteOne({ userId: user._id });
      await Session.deleteMany({ userId: user._id });
      await user.deleteOne();
      
    } else if (action === "deactivate") {
      user.isActive = false;
      // Increment session version to log out of all active sessions immediately
      user.sessionVersion = (user.sessionVersion || 0) + 1;
      await user.save();
      await Session.deleteMany({ userId: user._id });
    }

    const res = NextResponse.json({ message: "Account " + (action === "delete" ? "deleted" : "deactivated") });
    clearAuthCookie(res);
    return res;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
