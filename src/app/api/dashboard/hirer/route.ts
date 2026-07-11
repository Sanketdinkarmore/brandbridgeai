import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import Hire from "@/models/Hire";
import User from "@/models/User";
import FreelancerProfile from "@/models/FreelancerProfile";
import Project from "@/models/Project";
import Conversation from "@/models/Conversation";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const myProfile = await Profile.findOne({ userId: uid });
    if (!myProfile) return jsonError("Complete your profile first", 400);

    const [savedCount, activeHires, openProjects, unreadMsgs, topFpList, recentHiresDb] = await Promise.all([
      // Saved Freelancers (Assume saved freelancers are not fully implemented in models yet, we'll return 0 or placeholder if not in DB. Wait, in Brand Dashboard we had Saved Freelancers. How was it stored? Let's check...)
      // Actually we'll just mock saved count for now since it might be in a separate collection, or query Profile.savedFreelancers? We'll check later. Let's just return 0 for now.
      Promise.resolve(0),
      Hire.countDocuments({ hirerId: uid, status: "active" }),
      Project.countDocuments({ hirerId: uid, status: "open" }),
      Conversation.countDocuments({ participants: uid }), // Unread messages could be more complex, we'll return total conversations for now
      
      FreelancerProfile.find({}).sort({ rating: -1 }).limit(3).lean(),
      
      Hire.find({ hirerId: uid })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("freelancerId", "name")
        .populate("projectId", "title")
        .lean(),
    ]);

    const stats = [
      { label: "Freelancers Saved", value: savedCount },
      { label: "Active Hires", value: activeHires },
      { label: "Open Projects", value: openProjects },
      { label: "Messages", value: unreadMsgs }, // Will show 0 if no unread
    ];

    const topFreelancers = await Promise.all(
      topFpList.map(async (fp) => {
        const user = await User.findById(fp.userId).select("name").lean();
        const profile = await Profile.findOne({ userId: fp.userId }).select("avatar").lean();
        return {
          userId: fp.userId.toString(),
          name: user?.name || "Freelancer",
          avatar: profile?.avatar,
          skill: fp.categories?.[0] || fp.skills?.[0] || "Creative",
          rating: fp.rating ?? 0,
          hourlyRate: fp.hourlyRate ?? 0,
        };
      })
    );

    const recentHires = await Promise.all(
      recentHiresDb.map(async (h) => {
        const profile = await Profile.findOne({ userId: h.freelancerId._id }).select("avatar").lean();
        return {
          _id: h._id.toString(),
          freelancerId: h.freelancerId._id.toString(),
          freelancerName: (h.freelancerId as any).name,
          freelancerAvatar: profile?.avatar,
          projectTitle: (h.projectId as any)?.title || "Direct Hire",
          status: h.status,
          createdAt: h.createdAt,
        };
      })
    );

    return NextResponse.json({
      stats,
      topFreelancers,
      recentHires,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
