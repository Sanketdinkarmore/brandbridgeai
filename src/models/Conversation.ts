import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessageAt: Date;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessage: String,
  },
  { timestamps: true },
);

ConversationSchema.index({ participants: 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
