import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import DocumentModel from "@/models/Document";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const documents = await DocumentModel.find({ userId: result.auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    if (!body.title || !body.fileName || !body.url) {
      return jsonError("Title, fileName, and URL are required", 400);
    }

    await connectDB();
    const doc = await DocumentModel.create({
      userId: result.auth.userId,
      title: body.title,
      fileName: body.fileName,
      url: body.url,
      fileType: body.fileType ?? "pdf",
      fileSize: body.fileSize ?? 1024,
      folder: body.folder ?? "General",
      isPublic: body.isPublic ?? false,
      campaignId: body.campaignId || undefined,
    });

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "document_uploaded",
      `Uploaded document "${doc.title}"`
    );

    return NextResponse.json({ document: doc }, { status: 201 });
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
    if (!id) return jsonError("Document ID is required", 400);

    await connectDB();
    const doc = await DocumentModel.findOneAndUpdate(
      { _id: id, userId: result.auth.userId },
      { $set: updates },
      { new: true }
    );

    if (!doc) return jsonError("Document not found", 404);

    await logActivity(
      result.auth.userId,
      result.auth.email,
      "document_updated",
      `Updated document metadata for "${doc.title}"`
    );

    return NextResponse.json({ document: doc });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
