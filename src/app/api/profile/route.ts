import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { profileSchema, freelancerProfileSchema } from "@/lib/validators";
import Profile from "@/models/Profile";
import FreelancerProfile from "@/models/FreelancerProfile";
import User from "@/models/User";
import type { UserRole } from "@/lib/roles";

export async function GET() {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const user = await User.findById(result.auth.userId).select("name email role");
    if (!user?.role) return jsonError("User role not set", 400);

    let profile = await Profile.findOne({ userId: result.auth.userId });
    if (!profile) {
      profile = await Profile.create({
        userId: result.auth.userId,
        role: user.role as UserRole,
        socialLinks: {},
      });
    }

    let freelancerProfile = null;
    if (user.role === "freelancer") {
      freelancerProfile = await FreelancerProfile.findOne({ userId: result.auth.userId });
      if (!freelancerProfile) {
        freelancerProfile = await FreelancerProfile.create({
          userId: result.auth.userId,
          skills: [],
          categories: [],
        });
      }
    }

    return NextResponse.json({ profile, freelancerProfile, user });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(profileSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const user = await User.findById(result.auth.userId);
    if (!user?.role) return jsonError("User role not set", 400);

    const profileData = { ...parsed.data };
    if (profileData.website === "") delete profileData.website;
    if (profileData.marketingBudget !== undefined && Number.isNaN(profileData.marketingBudget)) {
      delete profileData.marketingBudget;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: result.auth.userId },
      {
        $set: {
          ...profileData,
          role: user.role,
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    if (user.role === "freelancer") {
      const fpInput = body.freelancerProfile ?? {};
      const fpParsed = parseBody(freelancerProfileSchema, fpInput);
      const fpData = "error" in fpParsed
        ? { skills: [] as string[], categories: [] as string[] }
        : fpParsed.data!;
      await FreelancerProfile.findOneAndUpdate(
        { userId: result.auth.userId },
        {
          $set: {
            skills: fpData.skills ?? [],
            categories: fpData.categories ?? [],
            hourlyRate: fpData.hourlyRate,
            availability: fpData.availability,
            experience: fpData.experience,
          },
        },
        { upsert: true, new: true },
      );
    }

    const freelancerProfile =
      user.role === "freelancer"
        ? await FreelancerProfile.findOne({ userId: result.auth.userId })
        : null;

    return NextResponse.json({ profile, freelancerProfile });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
