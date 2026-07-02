import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { ProductStatus } from "./types";

export interface IProduct extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  category?: string;
  images: string[];
  targetAudience?: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    category: String,
    images: [{ type: String }],
    targetAudience: String,
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "active",
    },
  },
  { timestamps: true },
);

ProductSchema.index({ userId: 1, status: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
