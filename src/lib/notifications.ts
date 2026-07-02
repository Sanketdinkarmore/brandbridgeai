import { Types } from "mongoose";
import Notification from "@/models/Notification";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
) {
  await Notification.create({
    userId: new Types.ObjectId(userId),
    type,
    title,
    message,
    link,
  });
}
