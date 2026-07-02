import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { CollaborationStatus } from "./types";

export interface ICollaboration extends Document {
  initiatorId: Types.ObjectId;
  partnerId: Types.ObjectId;
  status: CollaborationStatus;
  proposal?: string;
  emailDraft?: string;
  compatibilityScore?: number;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new Schema<ICollaboration>(
  {
    initiatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partnerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    proposal: String,
    emailDraft: String,
    compatibilityScore: Number,
    message: String,
  },
  { timestamps: true },
);

CollaborationSchema.index({ initiatorId: 1, partnerId: 1 });

const Collaboration: Model<ICollaboration> =
  mongoose.models.Collaboration ||
  mongoose.model<ICollaboration>("Collaboration", CollaborationSchema);

export default Collaboration;
