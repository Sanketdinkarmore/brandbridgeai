import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAutomation extends Document {
  userId: Types.ObjectId;
  name: string;
  trigger: "campaign_approved" | "collaboration_accepted" | "task_completed" | "product_activated" | "project_approved" | "hire_accepted" | "payment_released" | "project_completed" | "promotion_accepted";
  actions: ("create_task" | "notify_team" | "generate_report" | "send_email")[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationSchema = new Schema<IAutomation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    trigger: {
      type: String,
      enum: ["campaign_approved", "collaboration_accepted", "task_completed", "product_activated", "project_approved", "hire_accepted", "payment_released", "project_completed", "promotion_accepted"],
      required: true,
      index: true,
    },
    actions: [
      {
        type: String,
        enum: ["create_task", "notify_team", "generate_report", "send_email"],
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Automation: Model<IAutomation> =
  mongoose.models.Automation || mongoose.model<IAutomation>("Automation", AutomationSchema);

export default Automation;
