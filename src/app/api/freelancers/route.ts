import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import FreelancerProfile from "@/models/FreelancerProfile";
import PortfolioItem from "@/models/PortfolioItem";
import User from "@/models/User";
import SavedFreelancer from "@/models/SavedFreelancer";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const skill = searchParams.get("skill");
    const minRate = searchParams.get("minRate");
    const maxRate = searchParams.get("maxRate");
    const q = searchParams.get("q");

    await connectDB();

    const freelancerUsers = await User.find({ role: "freelancer" }).select("_id name email");
    const userIds = freelancerUsers.map((u) => u._id);

    const fpFilter: Record<string, unknown> = { userId: { $in: userIds } };
    if (category) fpFilter.categories = category;
    if (skill) fpFilter.skills = skill;
    if (minRate || maxRate) {
      fpFilter.hourlyRate = {};
      if (minRate) (fpFilter.hourlyRate as Record<string, number>).$gte = Number(minRate);
      if (maxRate) (fpFilter.hourlyRate as Record<string, number>).$lte = Number(maxRate);
    }

    const freelancerProfiles = await FreelancerProfile.find(fpFilter);
    const fpUserIds = freelancerProfiles.map((fp) => fp.userId);

    const profileFilter: Record<string, unknown> = {
      userId: { $in: fpUserIds.length ? fpUserIds : userIds },
      role: "freelancer",
    };
    if (q) {
      profileFilter.$or = [
        { companyName: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
      ];
    }

    const profiles = await Profile.find(profileFilter);
    const saved = await SavedFreelancer.find({ userId: result.auth.userId });
    const savedIds = new Set(saved.map((s) => s.freelancerId.toString()));

    const freelancers = await Promise.all(
      profiles.map(async (profile) => {
        const user = freelancerUsers.find((u) => u._id.toString() === profile.userId.toString());
        const fp = freelancerProfiles.find((f) => f.userId.toString() === profile.userId.toString());
        const portfolio = await PortfolioItem.find({ userId: profile.userId }).limit(3);
        return {
          user: user ? { _id: user._id, name: user.name, email: user.email } : null,
          profile,
          freelancerProfile: fp,
          portfolio,
          saved: savedIds.has(profile.userId.toString()),
        };
      }),
    );

    return NextResponse.json({ freelancers });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
