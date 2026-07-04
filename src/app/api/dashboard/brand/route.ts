import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import Collaboration from "@/models/Collaboration";
import Campaign from "@/models/Campaign";
import Hire from "@/models/Hire";
import Notification from "@/models/Notification";
import User from "@/models/User";
import FreelancerProfile from "@/models/FreelancerProfile";
import PortfolioItem from "@/models/PortfolioItem";
import Proposal from "@/models/Proposal";
import { analyzeBrandCompatibility, discoverExternalBrands } from "@/lib/ai/matching";
import { calculateProfileCompleteness } from "@/lib/profile-completeness";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const myProfile = await Profile.findOne({ userId: uid });
    if (!myProfile) return jsonError("Complete your profile first", 400);

    const [matchCount, collabs, campaigns, hires] = await Promise.all([
      Profile.countDocuments({ role: "brand", userId: { $ne: uid }, profileComplete: true }),
      Collaboration.countDocuments({
        $or: [{ initiatorId: uid }, { partnerId: uid }],
        status: "accepted",
      }),
      Campaign.countDocuments({ ownerId: uid }),
      Hire.countDocuments({ hirerId: uid }),
    ]);

    const stats = [
      { label: "Brand Matches", value: matchCount },
      { label: "Active Collaborations", value: collabs },
      { label: "Campaigns", value: campaigns },
      { label: "Freelancers Hired", value: hires },
    ];

    const candidateBrands = await Profile.find({
      role: "brand",
      userId: { $ne: uid },
      profileComplete: true,
    }).limit(5);

    const recommendationsPromise = Promise.all(
      candidateBrands.slice(0, 3).map(async (b) => {
        const match = await analyzeBrandCompatibility(
          {
            companyName: myProfile.companyName,
            industry: myProfile.industry,
            targetAudience: myProfile.targetAudience,
            marketingBudget: myProfile.marketingBudget,
            bio: myProfile.bio,
          },
          {
            brandId: b.userId.toString(),
            companyName: b.companyName,
            industry: b.industry,
            targetAudience: b.targetAudience,
            marketingBudget: b.marketingBudget,
            bio: b.bio,
          },
        );
        return {
          brandId: b.userId.toString(),
          companyName: b.companyName || "Brand",
          logo: b.logo,
          industry: b.industry,
          compatibilityScore: match.compatibilityScore,
          reason: match.audienceMatch,
          estimatedReach: match.estimatedReach,
        };
      }),
    );

    const externalRecommendationsPromise = discoverExternalBrands({
      companyName: myProfile.companyName,
      industry: myProfile.industry,
      targetAudience: myProfile.targetAudience,
      marketingBudget: myProfile.marketingBudget,
      bio: myProfile.bio,
    });

    const [recommendations, externalRecommendations] = await Promise.all([
      recommendationsPromise,
      externalRecommendationsPromise,
    ]);

    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const pendingRaw = await Collaboration.find({
      $or: [{ initiatorId: uid }, { partnerId: uid }],
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const pendingProposals = await Promise.all(
      pendingRaw.map(async (c) => {
        const isIncoming = c.partnerId.toString() === uid.toString();
        const otherId = isIncoming ? c.initiatorId : c.partnerId;
        const [otherUser, otherProfile] = await Promise.all([
          User.findById(otherId).select("name").lean(),
          Profile.findOne({ userId: otherId }).select("avatar logo companyName").lean(),
        ]);
        return {
          _id: c._id.toString(),
          type: "Collaboration Request",
          status: "Awaiting Response",
          isIncoming,
          partnerName: otherProfile?.companyName || otherUser?.name || "Unknown",
          partnerAvatar: otherProfile?.logo || otherProfile?.avatar,
          compatibilityScore: c.compatibilityScore,
          proposal: c.proposal,
          createdAt: c.createdAt,
        };
      }),
    );

    const freelancerUsers = await User.find({ role: "freelancer" }).limit(20).select("_id name");
    const fpList = await FreelancerProfile.find({
      userId: { $in: freelancerUsers.map((u) => u._id) },
    })
      .sort({ rating: -1 })
      .limit(3);

    const recommendedFreelancers = await Promise.all(
      fpList.map(async (fp) => {
        const user = freelancerUsers.find((u) => u._id.toString() === fp.userId.toString());
        const profile = await Profile.findOne({ userId: fp.userId }).select("avatar").lean();
        const portfolio = await PortfolioItem.find({ userId: fp.userId }).limit(1).lean();
        return {
          userId: fp.userId.toString(),
          name: user?.name || "Freelancer",
          avatar: profile?.avatar,
          skill: fp.categories?.[0] || fp.skills?.[0] || "Creative",
          rating: fp.rating ?? 4.5,
          hourlyRate: fp.hourlyRate ?? 50,
          portfolioThumb: portfolio[0]?.mediaUrl,
        };
      }),
    );

    const notifications = await Notification.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentProposals = await Proposal.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("freelancerId", "name")
      .populate("campaignId", "title ownerId")
      .lean();

    const activity: { type: string; message: string; timestamp: string }[] = [];

    for (const n of notifications) {
      activity.push({
        type: n.type,
        message: n.message,
        timestamp: n.createdAt.toISOString(),
      });
    }

    const recentCollabs = await Collaboration.find({
      $or: [{ initiatorId: uid }, { partnerId: uid }],
      status: "accepted",
    })
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate("initiatorId", "name")
      .populate("partnerId", "name")
      .lean();

    for (const c of recentCollabs) {
      const partner =
        c.partnerId.toString() === uid.toString()
          ? (c.initiatorId as { name?: string })
          : (c.partnerId as { name?: string });
      activity.push({
        type: "collaboration",
        message: `${partner?.name || "A brand"} accepted your collaboration request`,
        timestamp: c.updatedAt.toISOString(),
      });
    }

    for (const p of recentProposals) {
      const campaign = p.campaignId as { title?: string; ownerId?: Types.ObjectId } | null;
      if (campaign?.ownerId?.toString() === uid.toString()) {
        const freelancer = p.freelancerId as { name?: string };
        activity.push({
          type: "proposal",
          message: `${freelancer?.name || "A freelancer"} applied to your campaign "${campaign.title || "Campaign"}"`,
          timestamp: p.createdAt.toISOString(),
        });
      }
    }

    activity.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const profileCompleteness = calculateProfileCompleteness(
      myProfile.toObject(),
      "brand",
    );

    return NextResponse.json({
      stats,
      recommendations,
      externalRecommendations,
      pendingProposals,
      recommendedFreelancers,
      activity: activity.slice(0, 8),
      profileCompleteness,
      escrow: {
        inEscrow: 0,
        released: 0,
        pending: 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
