import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Task from "@/models/Task";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const tasks = await Task.find({ userId: result.auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    if (!body.title) return jsonError("Title is required", 400);

    await connectDB();
    const task = await Task.create({
      userId: result.auth.userId,
      title: body.title,
      description: body.description,
      priority: body.priority ?? "medium",
      status: body.status ?? "todo",
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      subtasks: body.subtasks ?? [],
      checklist: body.checklist ?? [],
      assigneeName: body.assigneeName,
      progress: body.progress ?? 0,
      campaignId: body.campaignId || undefined,
    });

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "task_created",
      `Created task "${task.title}"`
    );

    return NextResponse.json({ task }, { status: 201 });
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
    if (!id) return jsonError("Task ID is required", 400);

    await connectDB();
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: updates },
      { new: true }
    );

    if (!task) return jsonError("Task not found", 404);

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "task_updated",
      `Updated task "${task.title}"`
    );

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
