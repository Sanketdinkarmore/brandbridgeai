import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProductOwnerStatus = "draft" | "active" | "archived";

export interface PerformanceDay {
  date: string;
  views: number;
  collaborationRequests: number;
}

export interface ProductAnalytics {
  views: number;
  collaborationRequests: number;
  performanceHistory: PerformanceDay[];
}

export interface IProductOwnerProduct extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  images: string[];
  targetAudience?: string;
  status: ProductOwnerStatus;
  collaborationGoals?: string;
  marketingBudget?: number;
  analytics: ProductAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceDaySchema = new Schema<PerformanceDay>(
  {
    date: { type: String, required: true },
    views: { type: Number, default: 0 },
    collaborationRequests: { type: Number, default: 0 },
  },
  { _id: false },
);

const ProductOwnerProductSchema = new Schema<IProductOwnerProduct>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    category: String,
    tags: [{ type: String, trim: true }],
    images: [{ type: String }],
    targetAudience: String,
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
    collaborationGoals: String,
    marketingBudget: { type: Number, min: 0 },
    analytics: {
      views: { type: Number, default: 0 },
      collaborationRequests: { type: Number, default: 0 },
      performanceHistory: { type: [PerformanceDaySchema], default: [] },
    },
  },
  { timestamps: true, collection: "po_products" },
);

ProductOwnerProductSchema.index({ userId: 1, status: 1 });
ProductOwnerProductSchema.index({ userId: 1, category: 1 });
ProductOwnerProductSchema.index({ userId: 1, tags: 1 });
ProductOwnerProductSchema.index({ name: "text", description: "text", category: "text" });

const ProductOwnerProduct: Model<IProductOwnerProduct> =
  mongoose.models.ProductOwnerProduct ||
  mongoose.model<IProductOwnerProduct>("ProductOwnerProduct", ProductOwnerProductSchema);

export default ProductOwnerProduct;
