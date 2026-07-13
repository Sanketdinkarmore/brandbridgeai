import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "brand" | "product_owner" | "freelancer" | "hirer";
export type AuthProvider = "email" | "google";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  authProvider: AuthProvider;
  googleId?: string;
  isEmailVerified: boolean;
  otp?: { code: string; expiresAt: Date };
  resetToken?: { token: string; expiresAt: Date };
  role?: UserRole | null;
  onboardingComplete: boolean;
  blockedUsers: Types.ObjectId[];
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  notificationPreferences: {
    newMessages: boolean;
    statusUpdates: boolean;
    proposals: boolean;
    marketing: boolean;
  };
  sessionVersion: number;
  isActive: boolean;
  pendingEmail?: string;
  emailVerificationToken?: { token: string; expiresAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    googleId: { type: String, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    otp: {
      code: String,
      expiresAt: Date,
    },
    resetToken: {
      token: String,
      expiresAt: Date,
    },
    role: {
      type: String,
      enum: ["brand", "product_owner", "freelancer", "hirer", null],
      default: null,
    },
    onboardingComplete: { type: Boolean, default: false },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    notificationPreferences: {
      newMessages: { type: Boolean, default: true },
      statusUpdates: { type: Boolean, default: true },
      proposals: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    sessionVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    pendingEmail: { type: String, lowercase: true, trim: true },
    emailVerificationToken: {
      token: String,
      expiresAt: Date,
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
