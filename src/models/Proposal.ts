import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ProposalStatus } from "./types";

export interface IProposal extends Document {
  freelancerId: Types.ObjectId;
  campaignId: Types.ObjectId;
  message?: string;
  rate?: number;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>(
  {
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    message: String,
    rate: Number,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true },
);

ProposalSchema.index({ freelancerId: 1, campaignId: 1 });

const Proposal: Model<IProposal> =
  mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);

export default Proposal;
