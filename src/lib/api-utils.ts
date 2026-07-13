import { NextResponse } from "next/server";
import { getAuthUser, type TokenPayload } from "@/lib/auth";
import User from "@/models/User";
import Session from "@/models/Session";

export async function requireAuth(): Promise<
  { auth: TokenPayload } | { error: NextResponse }
> {
  const auth = await getAuthUser();
  if (!auth) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await User.findById(auth.userId).select("isActive sessionVersion");
  if (!user || user.isActive === false) {
    return { error: NextResponse.json({ error: "Account deactivated or deleted" }, { status: 403 }) };
  }
  
  const dbSessionVersion = user.sessionVersion ?? 0;
  if (auth.sessionVersion !== undefined && dbSessionVersion !== auth.sessionVersion) {
    return { error: NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 }) };
  }

  if (auth.tokenIdentifier) {
    const sessionDoc = await Session.findOne({ tokenIdentifier: auth.tokenIdentifier });
    if (!sessionDoc) {
      return { error: NextResponse.json({ error: "Session revoked. Please log in again." }, { status: 401 }) };
    }
    // Optional: update lastActive periodically
    // if (Date.now() - sessionDoc.lastActive.getTime() > 1000 * 60 * 5) {
    //   await Session.updateOne({ _id: sessionDoc._id }, { lastActive: new Date() });
    // }
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
