import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { HireStatus } from "./types";

export interface IHire extends Document {
  hirerId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  campaignId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  status: HireStatus;
  rate?: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  declineReason?: string;
  deliverables?: { fileUrl: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const HireSchema = new Schema<IHire>(
  {
    hirerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    rate: Number,
    startDate: Date,
    endDate: Date,
    notes: String,
    declineReason: String,
    deliverables: [
      {
        fileUrl: String,
        name: String,
      }
    ]
  },
  { timestamps: true },
);

HireSchema.index({ hirerId: 1, freelancerId: 1 });

const Hire: Model<IHire> =
  mongoose.models.Hire || mongoose.model<IHire>("Hire", HireSchema);

export default Hire;
