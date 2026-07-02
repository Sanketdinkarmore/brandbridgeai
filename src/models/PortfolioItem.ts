import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPortfolioItem extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  mediaUrl: string;
  category?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: String,
    mediaUrl: { type: String, required: true },
    category: String,
    tags: [{ type: String }],
  },
  { timestamps: true },
);

PortfolioItemSchema.index({ userId: 1 });

const PortfolioItem: Model<IPortfolioItem> =
  mongoose.models.PortfolioItem ||
  mongoose.model<IPortfolioItem>("PortfolioItem", PortfolioItemSchema);

export default PortfolioItem;
