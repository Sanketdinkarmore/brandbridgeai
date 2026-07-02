import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const q = searchParams.get("q");

    await connectDB();
    const filter: Record<string, unknown> = {
      role: "brand",
      profileComplete: true,
      userId: { $ne: result.auth.userId },
    };
    if (industry) filter.industry = industry;
    if (q) {
      filter.$or = [
        { companyName: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
        { industry: { $regex: q, $options: "i" } },
      ];
    }

    const profiles = await Profile.find(filter).sort({ createdAt: -1 });
    const brands = await Promise.all(
      profiles.map(async (profile) => {
        const user = await User.findById(profile.userId).select("name email");
        return { profile, user };
      }),
    );

    return NextResponse.json({ brands });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
