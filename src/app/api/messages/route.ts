import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { messageSchema } from "@/lib/validators";
import { createNotification } from "@/lib/notifications";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) return jsonError("conversationId required");

    await connectDB();
    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === result.auth.userId)) {
      return jsonError("Conversation not found", 404);
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "name");

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(messageSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    let conversationId = parsed.data!.conversationId;

    if (!conversationId && parsed.data!.recipientId) {
      const uid = new Types.ObjectId(result.auth.userId);
      const rid = new Types.ObjectId(parsed.data!.recipientId);
      let conv = await Conversation.findOne({
        participants: { $all: [uid, rid], $size: 2 },
      });
      if (!conv) {
        conv = await Conversation.create({ participants: [uid, rid] });
      }
      conversationId = conv._id.toString();
    }

    if (!conversationId) return jsonError("conversationId or recipientId required");

    const conv = await Conversation.findById(conversationId);
    if (!conv || !conv.participants.some((p) => p.toString() === result.auth.userId)) {
      return jsonError("Conversation not found", 404);
    }

    const message = await Message.create({
      conversationId,
      senderId: result.auth.userId,
      text: parsed.data!.text,
      attachments: parsed.data!.attachments ?? [],
      readBy: [new Types.ObjectId(result.auth.userId)],
    });

    conv.lastMessageAt = new Date();
    conv.lastMessage = parsed.data!.text;
    await conv.save();

    const recipientId = conv.participants.find((p) => p.toString() !== result.auth.userId);
    if (recipientId) {
      await createNotification(
        recipientId.toString(),
        "message",
        "New message",
        parsed.data!.text.slice(0, 80),
        `/dashboard/messages`,
      );
    }

    return NextResponse.json({ message, conversationId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
