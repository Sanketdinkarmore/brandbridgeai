import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Session from "@/models/Session";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const sessions = await Session.find({ userId: result.auth.userId }).sort({ lastActive: -1 }).lean();

    return NextResponse.json({
      sessions: sessions.map(s => ({
        id: s._id.toString(),
        device: s.device,
        browser: s.browser,
        location: s.location,
        isCurrent: s.tokenIdentifier === result.auth.tokenIdentifier,
        lastActive: s.lastActive,
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");
    const allButCurrent = searchParams.get("allButCurrent") === "true";

    await connectDB();

    if (allButCurrent) {
      await Session.deleteMany({
        userId: result.auth.userId,
        tokenIdentifier: { $ne: result.auth.tokenIdentifier }
      });
      return NextResponse.json({ message: "Logged out of all other devices" });
    }

    if (!sessionId) return jsonError("Session ID required");

    const session = await Session.findOne({ _id: sessionId, userId: result.auth.userId });
    if (!session) return jsonError("Session not found", 404);

    if (session.tokenIdentifier === result.auth.tokenIdentifier) {
      return jsonError("Cannot log out of current session from here. Use the main logout button.", 400);
    }

    await session.deleteOne();
    return NextResponse.json({ message: "Session revoked" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
