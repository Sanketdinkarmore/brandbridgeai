import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireProductOwnerAuth } from "../../lib/api-utils";
import ProductOwnerProduct from "../../_models/ProductOwnerProduct";
import ProductOwnerCollaborationRequest from "../../_models/ProductOwnerCollaborationRequest";

export async function GET() {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const summary = await ProductOwnerProduct.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$analytics.views" },
          totalRequests: { $sum: "$analytics.collaborationRequests" },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          archivedProducts: {
            $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] },
          },
        },
      },
    ]);

    const products = await ProductOwnerProduct.find({ userId: uid })
      .select("name status category analytics marketingBudget updatedAt")
      .sort({ "analytics.views": -1 })
      .lean();

    const signedCollaborations = await ProductOwnerCollaborationRequest.countDocuments({
      userId: uid,
      status: "accepted",
    });

    const performanceHistory = await ProductOwnerProduct.aggregate([
      { $match: { userId: uid } },
      { $unwind: "$analytics.performanceHistory" },
      {
        $group: {
          _id: "$analytics.performanceHistory.date",
          views: { $sum: "$analytics.performanceHistory.views" },
          collaborationRequests: {
            $sum: "$analytics.performanceHistory.collaborationRequests",
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    return NextResponse.json({
      summary: summary[0]
        ? { ...summary[0], signedCollaborations }
        : {
            totalViews: 0,
            totalRequests: 0,
            activeProducts: 0,
            draftProducts: 0,
            archivedProducts: 0,
            signedCollaborations: 0,
          },
      products,
      performanceHistory: performanceHistory.map((row: any) => ({
        date: row._id,
        views: row.views,
        collaborationRequests: row.collaborationRequests,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
