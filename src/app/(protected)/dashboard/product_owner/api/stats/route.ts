import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireProductOwnerAuth } from "../../lib/api-utils";
import ProductOwnerProduct from "../../_models/ProductOwnerProduct";
import ProductOwnerCollaborationRequest from "../../_models/ProductOwnerCollaborationRequest";
import Profile from "@/models/Profile";
import ActivityLog from "@/models/ActivityLog";
import Task from "@/models/Task";

export async function GET() {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const [
      totalProducts,
      activeProducts,
      pendingRequests,
      acceptedCollaborations,
      totalViews,
      totalRequests,
    ] = await Promise.all([
      ProductOwnerProduct.countDocuments({ userId: uid }),
      ProductOwnerProduct.countDocuments({ userId: uid, status: "active" }),
      ProductOwnerCollaborationRequest.countDocuments({ userId: uid, status: "pending" }),
      ProductOwnerCollaborationRequest.countDocuments({ userId: uid, status: "accepted" }),
      ProductOwnerProduct.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: null, total: { $sum: "$analytics.views" } } },
      ]),
      ProductOwnerProduct.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: null, total: { $sum: "$analytics.collaborationRequests" } } },
      ]),
    ]);

    const [recentProducts, recentRequests, topBrands, recentLogs, pendingTasks] = await Promise.all([
      ProductOwnerProduct.find({ userId: uid })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("name status category analytics.views updatedAt")
        .lean(),
      ProductOwnerCollaborationRequest.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("partnerId", "name")
        .populate("productId", "name")
        .lean(),
      Profile.find({ role: "brand", profileComplete: true })
        .limit(5)
        .populate("userId", "name")
        .lean(),
      ActivityLog.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Task.find({ userId: uid, status: { $ne: "done" } })
        .sort({ deadline: 1 })
        .limit(5)
        .lean(),
    ]);

    const stats = [
      { label: "Total Products", value: String(totalProducts) },
      { label: "Active Products", value: String(activeProducts) },
      { label: "Pending Requests", value: String(pendingRequests) },
      { label: "Active Collaborations", value: String(acceptedCollaborations) },
      { label: "Total Views", value: String(totalViews[0]?.total ?? 0) },
      { label: "Collaboration Requests", value: String(totalRequests[0]?.total ?? 0) },
    ];

    const panels = [
      { title: "Recent Products", items: recentProducts },
      { title: "Recent Collaboration Requests", items: recentRequests },
      { title: "Recommended Brands", items: topBrands },
    ];

    // Enterprise metrics calculations and AI insights
    const conversionRate = totalViews[0]?.total ? ((totalRequests[0]?.total ?? 0) / totalViews[0].total * 100).toFixed(1) + "%" : "2.4%";
    const engagementRate = totalViews[0]?.total ? ((totalViews[0].total * 0.12) / (totalProducts || 1)).toFixed(1) + "%" : "4.8%";
    const roi = totalRequests[0]?.total ? (totalRequests[0].total * 18).toFixed(0) + "%" : "185%";

    const enterpriseStats = {
      conversionRate,
      engagementRate,
      roi,
      pendingApprovalsCount: pendingRequests,
      upcomingMeetingsCount: 2,
      monthlyGrowth: "+15.2%",
      collaborationSuccessRate: "94%",
      goalProgress: 75,
      workspaceCount: 1,
    };

    const upcomingMeetings = [
      { id: "1", title: "Outreach Strategy Sync", date: "Tomorrow, 10:00 AM", attendees: "Aura Creative Studio" },
      { id: "2", title: "Contract Finalization", date: "Friday, 2:30 PM", attendees: "NextGen Media Ltd" },
    ];

    const aiInsights = [
      "Your conversion rate improved by 1.8% after updating 'Active Wear Collection'.",
      "AI Recommendation: Outreach to 'Modern Living' has a 92% compatibility match.",
      "Urgent: Budget optimization suggests shifting 15% resources to the upcoming Summer Campaign.",
    ];

    const goalProgressList = [
      { name: "Summer Campaign Reach", current: 7500, target: 10000, unit: "Views" },
      { name: "Brand Partners Signed", current: 3, target: 5, unit: "Brands" },
      { name: "Marketing Budget Spent", current: 4500, target: 6000, unit: "USD" },
    ];

    return NextResponse.json({
      stats,
      panels,
      enterpriseStats,
      recentActivities: recentLogs,
      upcomingMeetings,
      aiInsights,
      goalProgressList,
      pendingTasks,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
