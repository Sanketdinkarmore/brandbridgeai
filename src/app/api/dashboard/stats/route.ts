import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import Product from "@/models/Product";
import Collaboration from "@/models/Collaboration";
import Campaign from "@/models/Campaign";
import Hire from "@/models/Hire";
import Proposal from "@/models/Proposal";
import Conversation from "@/models/Conversation";
import SavedFreelancer from "@/models/SavedFreelancer";
import PortfolioItem from "@/models/PortfolioItem";
import User from "@/models/User";
import type { UserRole } from "@/lib/roles";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const userId = result.auth.userId;
    const user = await User.findById(userId).select("role");
    const role = user?.role as UserRole;

    const uid = new Types.ObjectId(userId);

    let stats: { label: string; value: string }[] = [];
    let panels: { title: string; items: unknown[] }[] = [];

    switch (role) {
      case "brand": {
        const [matches, collabs, campaigns, hires] = await Promise.all([
          Profile.countDocuments({ role: "brand", userId: { $ne: uid }, profileComplete: true }),
          Collaboration.countDocuments({
            $or: [{ initiatorId: uid }, { partnerId: uid }],
            status: "accepted",
          }),
          Campaign.countDocuments({ ownerId: uid }),
          Hire.countDocuments({ hirerId: uid }),
        ]);
        const pending = await Collaboration.find({
          $or: [{ initiatorId: uid }, { partnerId: uid }],
          status: "pending",
        })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        const brands = await Profile.find({ role: "brand", userId: { $ne: uid }, profileComplete: true })
          .limit(5)
          .populate("userId", "name")
          .lean();
        stats = [
          { label: "Brand Matches", value: String(matches) },
          { label: "Active Collaborations", value: String(collabs) },
          { label: "Campaigns", value: String(campaigns) },
          { label: "Freelancers Hired", value: String(hires) },
        ];
        panels = [
          { title: "AI Brand Recommendations", items: brands },
          { title: "Pending Proposals", items: pending },
        ];
        break;
      }
      case "product_owner": {
        const [products, interests, promotions, convos] = await Promise.all([
          Product.countDocuments({ userId: uid }),
          Collaboration.countDocuments({ partnerId: uid }),
          Campaign.countDocuments({ ownerId: uid, status: "active" }),
          Conversation.countDocuments({ participants: uid }),
        ]);
        const brandList = await Profile.find({ role: "brand", profileComplete: true })
          .limit(5)
          .populate("userId", "name")
          .lean();
        const requests = await Collaboration.find({ partnerId: uid })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("initiatorId", "name")
          .lean();
        stats = [
          { label: "Products Listed", value: String(products) },
          { label: "Brand Interests", value: String(interests) },
          { label: "Active Promotions", value: String(promotions) },
          { label: "Messages", value: String(convos) },
        ];
        panels = [
          { title: "Recommended Brands", items: brandList },
          { title: "Promotion Requests", items: requests },
        ];
        break;
      }
      case "freelancer": {
        const [active, proposals, completed, earnings] = await Promise.all([
          Hire.countDocuments({ freelancerId: uid, status: "active" }),
          Proposal.countDocuments({ freelancerId: uid }),
          Hire.countDocuments({ freelancerId: uid, status: "completed" }),
          Hire.aggregate([
            { $match: { freelancerId: uid, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$rate" } } },
          ]),
        ]);
        const opportunities = await Campaign.find({ status: "active" })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        const portfolio = await PortfolioItem.find({ userId: uid })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        stats = [
          { label: "Active Projects", value: String(active) },
          { label: "Proposals Sent", value: String(proposals) },
          { label: "Completed Jobs", value: String(completed) },
          { label: "Total Earnings", value: `$${earnings[0]?.total ?? 0}` },
        ];
        panels = [
          { title: "New Project Opportunities", items: opportunities },
          { title: "Portfolio Highlights", items: portfolio },
        ];
        break;
      }
      case "hirer": {
        const [saved, activeHires, openProjects, convos] = await Promise.all([
          SavedFreelancer.countDocuments({ userId: uid }),
          Hire.countDocuments({ hirerId: uid, status: "active" }),
          Campaign.countDocuments({ ownerId: uid, status: "active" }),
          Conversation.countDocuments({ participants: uid }),
        ]);
        const recentHires = await Hire.find({ hirerId: uid })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("freelancerId", "name")
          .lean();
        stats = [
          { label: "Freelancers Saved", value: String(saved) },
          { label: "Active Hires", value: String(activeHires) },
          { label: "Open Projects", value: String(openProjects) },
          { label: "Messages", value: String(convos) },
        ];
        panels = [
          { title: "Top Freelancers", items: [] },
          { title: "Recent Hires", items: recentHires },
        ];
        break;
      }
    }

    return NextResponse.json({ stats, panels, role });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
