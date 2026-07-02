import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { aiMatchSchema } from "@/lib/validators";
import { analyzeBrandCompatibility } from "@/lib/ai/matching";
import Profile from "@/models/Profile";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(aiMatchSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user?.role) return jsonError("Role not set", 400);

    const myProfile = await Profile.findOne({ userId: result.auth.userId });
    if (!myProfile) return jsonError("Complete your profile first", 400);

    const limit = parsed.data!.limit ?? 10;

    if (user.role === "brand") {
      const brands = await Profile.find({
        role: "brand",
        userId: { $ne: result.auth.userId },
        profileComplete: true,
      }).limit(limit);

      const matches = await Promise.all(
        brands.map(async (b) => {
          return analyzeBrandCompatibility(
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
        }),
      );

      return NextResponse.json({
        matches: matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore),
      });
    }

    return jsonError("AI matching is available for brand accounts", 400);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
