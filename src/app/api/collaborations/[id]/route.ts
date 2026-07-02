import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { collaborationUpdateSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Collaboration from "@/models/Collaboration";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(collaborationUpdateSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) return jsonError("Collaboration not found", 404);

    const isPartner = collaboration.partnerId.toString() === result.auth.userId;
    const isInitiator = collaboration.initiatorId.toString() === result.auth.userId;
    if (!isPartner && !isInitiator) return jsonError("Forbidden", 403);

    collaboration.status = parsed.data!.status;
    await collaboration.save();

    const notifyId = isPartner
      ? collaboration.initiatorId.toString()
      : collaboration.partnerId.toString();

    await createNotification(
      notifyId,
      "collaboration",
      `Collaboration ${parsed.data!.status}`,
      `A collaboration request was ${parsed.data!.status}.`,
    );

    return NextResponse.json({ collaboration });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
