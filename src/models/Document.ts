import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDocumentVersion {
  version: number;
  fileName: string;
  url: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  fileName: string;
  url: string;
  fileType: string;
  fileSize: number;
  folder?: string;
  versions: IDocumentVersion[];
  sharedWith: { userId: Types.ObjectId; permission: "read" | "write" }[];
  isPublic: boolean;
  campaignId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentVersionSchema = new Schema<IDocumentVersion>({
  version: { type: Number, required: true },
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    folder: { type: String, default: "General", index: true },
    versions: [DocumentVersionSchema],
    sharedWith: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        permission: { type: String, enum: ["read", "write"], default: "read" },
      },
    ],
    isPublic: { type: Boolean, default: false },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
  },
  { timestamps: true }
);

const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema);

export default DocumentModel;
