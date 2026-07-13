import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Automation from "@/models/Automation";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const automations = await Automation.find({ userId: result.auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ automations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    if (!body.name || !body.trigger || !body.actions) {
      return jsonError("Name, trigger, and actions are required", 400);
    }

    await connectDB();
    const automation = await Automation.create({
      userId: result.auth.userId,
      name: body.name,
      trigger: body.trigger,
      actions: body.actions,
      isActive: body.isActive ?? true,
    });

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "automation_created",
      `Created automation workflow "${automation.name}"`
    );

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return jsonError("Automation ID is required", 400);

    await connectDB();
    const automation = await Automation.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!automation) return jsonError("Automation not found", 404);

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "automation_updated",
      `Updated automation workflow "${automation.name}"`
    );

    return NextResponse.json({ automation });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("Automation ID is required", 400);

    await connectDB();
    const automation = await Automation.findOneAndDelete({ _id: id, userId: result.auth.userId });
    
    if (!automation) return jsonError("Automation not found", 404);

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "automation_deleted",
      `Deleted automation workflow "${automation.name}"`
    );

    return NextResponse.json({ message: "Automation deleted" });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
