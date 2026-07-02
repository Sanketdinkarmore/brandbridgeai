import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  attachments: string[];
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    attachments: [{ type: String }],
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
