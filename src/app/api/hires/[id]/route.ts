import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { hireUpdateSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Hire from "@/models/Hire";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(hireUpdateSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const hire = await Hire.findById(id);
    if (!hire) return jsonError("Hire not found", 404);

    const isHirer = hire.hirerId.toString() === result.auth.userId;
    const isFreelancer = hire.freelancerId.toString() === result.auth.userId;
    if (!isHirer && !isFreelancer) return jsonError("Forbidden", 403);

    const newStatus = parsed.data!.status;
    if (newStatus) {
      if (isFreelancer) {
        if (hire.status === "pending" && !["active", "cancelled"].includes(newStatus)) {
          return jsonError("You can only accept or decline pending requests", 400);
        }
        if (hire.status === "active" && newStatus !== "completed") {
          return jsonError("You can only mark active projects as completed", 400);
        }
        if (hire.status !== "pending" && hire.status !== "active") {
          return jsonError("This hire can no longer be updated", 400);
        }
      }
      if (isHirer) {
        if (hire.status === "pending" && newStatus !== "cancelled") {
          return jsonError("Wait for the freelancer to accept, or cancel the request", 400);
        }
        if (hire.status === "active" && newStatus !== "completed") {
          return jsonError("You can only mark active hires as completed", 400);
        }
        if (hire.status === "pending" && newStatus === "cancelled") {
          // allow hirer to withdraw
        } else if (hire.status !== "active" && newStatus === "completed") {
          return jsonError("Only active hires can be completed", 400);
        }
      }
      hire.status = newStatus;
    }

    if (parsed.data!.rate !== undefined) hire.rate = parsed.data!.rate;
    if (parsed.data!.notes !== undefined) hire.notes = parsed.data!.notes;
    await hire.save();

    const notifyId = isHirer ? hire.freelancerId.toString() : hire.hirerId.toString();
    await createNotification(notifyId, "hire", "Hire updated", "A hire status was updated.");

    return NextResponse.json({ hire });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
