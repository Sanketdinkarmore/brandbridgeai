import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivityLog extends Document {
  userId: Types.ObjectId;
  userName: string;
  action: string;
  details: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
