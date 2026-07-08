import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CollaborationRequestStatus = "pending" | "accepted" | "declined";

export interface IProductOwnerCollaborationRequest extends Document {
  userId: Types.ObjectId;
  productId?: Types.ObjectId;
  partnerId: Types.ObjectId;
  status: CollaborationRequestStatus;
  message?: string;
  proposal?: string;
  compatibilityScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductOwnerCollaborationRequestSchema =
  new Schema<IProductOwnerCollaborationRequest>(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
      productId: { type: Schema.Types.ObjectId, ref: "ProductOwnerProduct" },
      partnerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
      },
      message: String,
      proposal: String,
      compatibilityScore: Number,
    },
    { timestamps: true, collection: "po_collaboration_requests" },
  );

ProductOwnerCollaborationRequestSchema.index({ userId: 1, status: 1 });
ProductOwnerCollaborationRequestSchema.index({ partnerId: 1, status: 1 });

const ProductOwnerCollaborationRequest: Model<IProductOwnerCollaborationRequest> =
  mongoose.models.ProductOwnerCollaborationRequest ||
  mongoose.model<IProductOwnerCollaborationRequest>(
    "ProductOwnerCollaborationRequest",
    ProductOwnerCollaborationRequestSchema,
  );

export default ProductOwnerCollaborationRequest;
