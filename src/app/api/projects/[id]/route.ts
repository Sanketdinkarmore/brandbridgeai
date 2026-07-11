import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Project from "@/models/Project";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const resolvedParams = await params;
    const project = await Project.findOne({
      _id: resolvedParams.id,
      hirerId: result.auth.userId,
    })
      .populate("assignedFreelancerId", "name")
      .lean();

    if (!project) return jsonError("Project not found", 404);

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    await connectDB();

    const resolvedParams = await params;
    const project = await Project.findOneAndUpdate(
      { _id: resolvedParams.id, hirerId: result.auth.userId },
      { $set: body },
      { returnDocument: "after" }
    );

    if (!project) return jsonError("Project not found", 404);

    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const resolvedParams = await params;
    const project = await Project.findOneAndDelete({
      _id: resolvedParams.id,
      hirerId: result.auth.userId,
    });

    if (!project) return jsonError("Project not found", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
