import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import {
  requireProductOwnerAuth,
  jsonError,
  parseBody,
  recordAnalyticsEvent,
} from "../../lib/api-utils";
import {
  productOwnerCollaborationSchema,
  productOwnerCollaborationUpdateSchema,
} from "../../lib/validators";
import ProductOwnerCollaborationRequest from "../../_models/ProductOwnerCollaborationRequest";
import ProductOwnerProduct from "../../_models/ProductOwnerProduct";

export async function GET() {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const collaborations = await ProductOwnerCollaborationRequest.find({
      $or: [{ userId: uid }, { partnerId: uid }],
    })
      .sort({ createdAt: -1 })
      .populate("partnerId", "name")
      .populate("productId", "name")
      .lean();

    return NextResponse.json({ collaborations });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(productOwnerCollaborationSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();

    if (parsed.data!.productId) {
      const product = await ProductOwnerProduct.findOne({
        _id: parsed.data!.productId,
        userId: result.auth.userId,
      });
      if (!product) return jsonError("Product not found", 404);

      recordAnalyticsEvent(product, "collaborationRequests");
      await product.save();
    }

    const collaboration = await ProductOwnerCollaborationRequest.create({
      userId: result.auth.userId,
      partnerId: parsed.data!.partnerId,
      productId: parsed.data!.productId,
      message: parsed.data!.message,
      proposal: parsed.data!.proposal,
      compatibilityScore: parsed.data!.compatibilityScore,
    });

    return NextResponse.json({ collaboration }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
