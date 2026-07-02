import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { UserRole } from "./types";

export interface ISocialLinks {
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  github?: string;
}

export interface IProfile extends Document {
  userId: Types.ObjectId;
  role: UserRole;
  avatar?: string;
  companyName?: string;
  logo?: string;
  bio?: string;
  industry?: string;
  location?: string;
  website?: string;
  socialLinks: ISocialLinks;
  targetAudience?: string;
  marketingBudget?: number;
  hiringPreferences?: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    role: {
      type: String,
      enum: ["brand", "product_owner", "freelancer", "hirer"],
      required: true,
    },
    avatar: String,
    companyName: String,
    logo: String,
    bio: String,
    industry: String,
    location: String,
    website: String,
    socialLinks: {
      linkedin: String,
      instagram: String,
      twitter: String,
      github: String,
    },
    targetAudience: String,
    marketingBudget: Number,
    hiringPreferences: String,
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ProfileSchema.index({ role: 1, industry: 1 });

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;
