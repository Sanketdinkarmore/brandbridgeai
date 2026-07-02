import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFreelancerProfile extends Document {
  userId: Types.ObjectId;
  skills: string[];
  categories: string[];
  hourlyRate?: number;
  availability?: string;
  experience?: string;
  rating: number;
  completedProjects: number;
  createdAt: Date;
  updatedAt: Date;
}

const FreelancerProfileSchema = new Schema<IFreelancerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skills: [{ type: String }],
    categories: [{ type: String }],
    hourlyRate: Number,
    availability: String,
    experience: String,
    rating: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Single-field index only — MongoDB cannot compound-index two array fields
FreelancerProfileSchema.index({ categories: 1 });

const FreelancerProfile: Model<IFreelancerProfile> =
  mongoose.models.FreelancerProfile ||
  mongoose.model<IFreelancerProfile>("FreelancerProfile", FreelancerProfileSchema);

export default FreelancerProfile;
