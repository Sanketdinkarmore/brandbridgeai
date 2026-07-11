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

  // New Brand Profile Fields
  companySize?: string;
  foundedYear?: number;
  businessType?: string;
  isRegisteredBusiness?: boolean;
  businessRegistrationNumber?: string;
  taxId?: string;
  subCategory?: string;
  targetAgeGroups?: string[];
  targetGender?: string;
  primaryMarket?: string;
  socialMediaReach?: {
    instagram?: number;
    youtube?: number;
    facebook?: number;
    tiktok?: number;
  };
  collaborationLookingFor?: string[];
  preferredCollaborationType?: string;
  budgetRange?: string;
  availabilityStatus?: string;

  // New Hirer Profile Fields
  accountType?: string;
  projectBudgetRange?: string;
  preferredCategories?: string[];
  paymentVerified?: boolean;
  totalProjectsPosted?: number;
  hireSuccessRate?: number;
  avgRatingGiven?: number;

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

    // New Brand Profile Fields
    companySize: String,
    foundedYear: Number,
    businessType: String,
    isRegisteredBusiness: { type: Boolean, default: false },
    businessRegistrationNumber: String,
    taxId: String,
    subCategory: String,
    targetAgeGroups: [String],
    targetGender: String,
    primaryMarket: String,
    socialMediaReach: {
      instagram: Number,
      youtube: Number,
      facebook: Number,
      tiktok: Number,
    },
    collaborationLookingFor: [String],
    preferredCollaborationType: String,
    budgetRange: String,
    availabilityStatus: { type: String, default: "Open to offers" },

    // New Hirer Profile Fields
    accountType: String,
    projectBudgetRange: String,
    preferredCategories: [String],
    paymentVerified: { type: Boolean, default: false },
    totalProjectsPosted: { type: Number, default: 0 },
    hireSuccessRate: { type: Number, default: 0 },
    avgRatingGiven: { type: Number, default: 0 },

    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ProfileSchema.index({ role: 1, industry: 1 });

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;
