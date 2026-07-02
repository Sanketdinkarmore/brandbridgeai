import { jwtVerify } from "jose";
import type { TokenPayload } from "./auth";

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function verifyTokenEdge(
  token: string,
): Promise<TokenPayload | null> {
  const secretKey = getSecretKey();
  if (!secretKey) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}
