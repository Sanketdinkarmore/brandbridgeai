import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavedFreelancer extends Document {
  userId: Types.ObjectId;
  freelancerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedFreelancerSchema = new Schema<ISavedFreelancer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    freelancerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

SavedFreelancerSchema.index({ userId: 1, freelancerId: 1 }, { unique: true });

const SavedFreelancer: Model<ISavedFreelancer> =
  mongoose.models.SavedFreelancer ||
  mongoose.model<ISavedFreelancer>("SavedFreelancer", SavedFreelancerSchema);

export default SavedFreelancer;
