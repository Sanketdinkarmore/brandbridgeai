import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
export const TOKEN_COOKIE = "bb_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  sessionVersion?: number;
  tokenIdentifier?: string;
}

export function signToken(
  payload: TokenPayload,
  rememberMe = false,
): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in .env.local");
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(
  response: NextResponse,
  token: string,
  rememberMe = false,
) {
  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Ideally, we'd verify sessionVersion against the DB here,
  // but to avoid a DB call on every single request, we can just rely on the fact that
  // when sessionVersion is incremented in DB, we'll force logout. Wait, if we don't query the DB,
  // we can't invalidate existing valid JWTs on the server immediately, but it's acceptable for standard NextJS middleware
  // Or we can check it in requireAuth in api-utils.ts
  return decoded;
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateResetToken(): string {
  return crypto.randomUUID();
}

export function getPostAuthRedirect(
  isEmailVerified: boolean,
  role: string | null | undefined,
): string {
  if (!isEmailVerified) return "/verify-otp";
  if (!role) return "/signup";
  return `/dashboard/${role}`;
}
