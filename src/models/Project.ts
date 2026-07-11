import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  budgetType: "fixed" | "hourly";
  budgetAmount: number;
  deadline: Date;
  requiredSkills: string[];
  attachments: string[];
  status: "open" | "in_progress" | "completed" | "closed";
  hirerId: Types.ObjectId;
  assignedFreelancerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    budgetType: { type: String, enum: ["fixed", "hourly"], required: true },
    budgetAmount: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    requiredSkills: [{ type: String }],
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "closed"],
      default: "open",
    },
    hirerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedFreelancerId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

ProjectSchema.index({ hirerId: 1, status: 1 });
ProjectSchema.index({ status: 1, category: 1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
