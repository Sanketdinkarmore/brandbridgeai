import mongoose, { Schema, Document, Model } from "mongoose";

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
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
