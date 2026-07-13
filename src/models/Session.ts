import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  tokenIdentifier: string; // To identify which JWT this session maps to (we can just use the exact created time or a random UUID in the JWT payload)
  userAgent: string;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenIdentifier: { type: String, required: true },
    userAgent: { type: String, required: true },
    ipAddress: { type: String },
    device: { type: String },
    browser: { type: String },
    location: { type: String, default: "Unknown" },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1 });
SessionSchema.index({ tokenIdentifier: 1 });

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
