import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { isValidRole } from "@/lib/roles";
import { getAppUrl, getGoogleRedirectUri } from "@/lib/app-url";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  const appUrl = getAppUrl(request);
  const redirectUri = getGoogleRedirectUri(request);

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_not_configured`);
  }

  if (!role || !isValidRole(role)) {
    return NextResponse.redirect(`${appUrl}/signup?error=select_role`);
  }

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );

  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile"],
    prompt: "select_account",
    state: role,
  });

  return NextResponse.redirect(url);
}
