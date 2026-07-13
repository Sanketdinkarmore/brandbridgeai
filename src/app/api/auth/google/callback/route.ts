import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getPostAuthRedirect, setAuthCookie, signToken } from "@/lib/auth";
import { isValidRole, type UserRole } from "@/lib/roles";
import { getAppUrl, getGoogleRedirectUri } from "@/lib/app-url";
import { UAParser } from "ua-parser-js";
import Session from "@/models/Session";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const appUrl = getAppUrl(request);
  const redirectUri = getGoogleRedirectUri(request);

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_not_configured`);
  }

  const selectedRole = state && isValidRole(state) ? (state as UserRole) : null;

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri,
    );

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
    }

    await connectDB();

    let user = await User.findOne({
      $or: [{ email: payload.email.toLowerCase() }, { googleId: payload.sub }],
    });

    if (!user) {
      if (!selectedRole) {
        return NextResponse.redirect(`${appUrl}/signup?error=select_role`);
      }

      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        authProvider: "google",
        googleId: payload.sub,
        isEmailVerified: true,
        role: selectedRole,
        onboardingComplete: true,
      });
    } else {
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.authProvider = "google";
        user.isEmailVerified = true;
      }

      if (selectedRole && user.role && user.role !== selectedRole) {
        return NextResponse.redirect(
          `${appUrl}/login?error=role_mismatch&expected=${user.role}`,
        );
      }

      if (!user.role && selectedRole) {
        user.role = selectedRole;
        user.onboardingComplete = true;
      }

      await user.save();
    }

    if (!user.role) {
      return NextResponse.redirect(`${appUrl}/signup?error=select_role`);
    }

    if (user.isActive === false) {
      user.isActive = true;
      await user.save();
    }

    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    const ip = request.headers.get("x-forwarded-for") || "Unknown IP";
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name ? `${parser.getBrowser().name} ${parser.getBrowser().version}` : "Unknown Browser";
    const os = parser.getOS().name ? `${parser.getOS().name} ${parser.getOS().version}` : "Unknown OS";
    
    const tokenIdentifier = crypto.randomUUID();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role ?? undefined,
      sessionVersion: user.sessionVersion || 0,
      tokenIdentifier,
    });

    await Session.create({
      userId: user._id,
      tokenIdentifier,
      userAgent,
      ipAddress: ip,
      device: os,
      browser,
      location: "Unknown",
    });

    const redirect = getPostAuthRedirect(user.isEmailVerified, user.role);
    const response = NextResponse.redirect(`${appUrl}${redirect}`);
    setAuthCookie(response, token);

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
  }
}
