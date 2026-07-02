import type { NextRequest } from "next/server";

/** Resolve the app base URL from the incoming request (works on any dev port). */
export function getAppUrl(request?: NextRequest): string {
  if (request) {
    return request.nextUrl.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getGoogleRedirectUri(request?: NextRequest): string {
  // In dev, always use the actual port the server is running on (e.g. 3001)
  if (request && process.env.NODE_ENV !== "production") {
    return `${request.nextUrl.origin}/api/auth/google/callback`;
  }

  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }

  return `${getAppUrl(request)}/api/auth/google/callback`;
}
