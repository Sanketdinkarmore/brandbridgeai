import { NextResponse } from "next/server";
import { getAuthUser, type TokenPayload } from "@/lib/auth";

export async function requireAuth(): Promise<
  { auth: TokenPayload } | { error: NextResponse }
> {
  const auth = await getAuthUser();
  if (!auth) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { auth };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseBody<T>(schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: { issues: { message: string }[] } } }, body: unknown) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { error: result.error!.issues[0].message };
  }
  return { data: result.data as T };
}
