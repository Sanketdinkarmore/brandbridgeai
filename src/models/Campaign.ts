import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { CampaignStatus } from "./types";

export interface ICampaign extends Document {
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  status: CampaignStatus;
  participants: Types.ObjectId[];
  budget?: number;
  collaborationId?: Types.ObjectId;
  productId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: String,
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    budget: Number,
    collaborationId: { type: Schema.Types.ObjectId, ref: "Collaboration" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true },
);

CampaignSchema.index({ ownerId: 1, status: 1 });

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
