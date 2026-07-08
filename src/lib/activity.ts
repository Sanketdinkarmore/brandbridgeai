import { connectDB } from "./mongodb";
import ActivityLog from "@/models/ActivityLog";
import { Types } from "mongoose";

export async function logActivity(
  userId: string | Types.ObjectId,
  userName: string,
  action: string,
  details: string,
  metadata?: Record<string, any>
) {
  try {
    await connectDB();
    await ActivityLog.create({
      userId: new Types.ObjectId(userId),
      userName,
      action,
      details,
      metadata,
    });
  } catch (error) {
    console.error("[logActivity] Failed:", error);
  }
}
