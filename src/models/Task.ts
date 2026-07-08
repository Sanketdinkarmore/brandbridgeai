import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITaskComment {
  userId: Types.ObjectId;
  userName: string;
  comment: string;
  createdAt: Date;
}

export interface ITaskChecklistItem {
  text: string;
  completed: boolean;
}

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  subtasks: { title: string; completed: boolean }[];
  checklist: ITaskChecklistItem[];
  assigneeId?: Types.ObjectId;
  assigneeName?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  deadline?: Date;
  comments: ITaskComment[];
  attachments: { name: string; url: string }[];
  progress: number;
  campaignId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TaskChecklistItemSchema = new Schema<ITaskChecklistItem>({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    checklist: [TaskChecklistItemSchema],
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    assigneeName: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    deadline: Date,
    comments: [TaskCommentSchema],
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
  },
  { timestamps: true }
);

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
