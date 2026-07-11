import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import BrandMatchCache from "@/models/BrandMatchCache";
import SavedMatch from "@/models/SavedMatch";
import Collaboration from "@/models/Collaboration";
import { analyzeBrandCompatibility, heuristicBrandMatch } from "@/lib/ai/matching";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const location = searchParams.get("location");
    const availability = searchParams.get("availability");
    const collabType = searchParams.get("type");
    const sort = searchParams.get("sort") || "score"; // score, newest, az
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const forceRefresh = searchParams.get("refresh") === "true";

    await connectDB();
    const uid = new Types.ObjectId(result.auth.userId);

    const myProfile = await Profile.findOne({ userId: uid });
    if (!myProfile) return jsonError("Complete your profile first", 400);

    // Build candidate query
    const query: any = {
      role: "brand",
      userId: { $ne: uid },
      profileComplete: true,
    };

    if (industry) query.industry = industry;
    if (location) query.location = { $regex: location, $options: "i" };
    if (availability) query.availabilityStatus = availability;
    if (collabType) query.preferredCollaborationType = collabType;
    if (search) {
      query.companyName = { $regex: search, $options: "i" };
    }

    const candidateProfiles = await Profile.find(query).lean();

    if (candidateProfiles.length === 0) {
      return NextResponse.json({ matches: [], total: 0 });
    }

    // Fetch existing cache
    let cachedMatches = await BrandMatchCache.find({
      brandA: uid,
      brandB: { $in: candidateProfiles.map(p => p.userId) }
    }).lean();

    // Fetch saved matches
    const savedMatches = await SavedMatch.find({
      userId: uid,
      savedBrandId: { $in: candidateProfiles.map(p => p.userId) }
    }).lean();
    const savedSet = new Set(savedMatches.map(s => s.savedBrandId.toString()));

    const collabs = await Collaboration.find({
      $or: [
        { initiatorId: uid },
        { partnerId: uid }
      ]
    }).lean();
    const requestedSet = new Set(collabs.flatMap(c => [c.initiatorId.toString(), c.partnerId.toString()]));

    if (forceRefresh) {
      // If forcing refresh, we clear the cache for these candidates so they regenerate
      await BrandMatchCache.deleteMany({ brandA: uid });
      cachedMatches = [];
    }

    // Map candidates to their scores (using cache or heuristic for initial sort)
    let sortedCandidates = candidateProfiles.map(profile => {
      const cache = cachedMatches.find(c => c.brandB.toString() === profile.userId.toString());
      let score = 0;
      let isCached = false;
      let matchedAt = profile.createdAt;

      if (cache) {
        score = cache.compatibilityScore;
        isCached = true;
        matchedAt = cache.matchedAt;
      } else {
        const heuristic = heuristicBrandMatch(myProfile as any, { ...profile, brandId: profile.userId.toString() } as any);
        score = heuristic.compatibilityScore;
      }

      return { profile, score, isCached, matchedAt };
    });

    // Apply sorting
    if (sort === "score") {
      sortedCandidates.sort((a, b) => b.score - a.score);
    } else if (sort === "newest") {
      sortedCandidates.sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime());
    } else if (sort === "az") {
      sortedCandidates.sort((a, b) => (a.profile.companyName || "").localeCompare(b.profile.companyName || ""));
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginated = sortedCandidates.slice(startIndex, startIndex + limit);

    // Resolve real AI matches for the current page
    const resolvedMatches = await Promise.all(
      paginated.map(async ({ profile, isCached }) => {
        let matchData;
        const brandId = profile.userId.toString();
        const isSaved = savedSet.has(brandId);
        const isRequested = requestedSet.has(brandId);

        if (isCached && !forceRefresh) {
          const cache = cachedMatches.find(c => c.brandB.toString() === brandId)!;
          matchData = {
            brandId,
            companyName: profile.companyName,
            logo: profile.logo,
            industry: profile.industry,
            compatibilityScore: cache.compatibilityScore,
            scoreBreakdown: cache.scoreBreakdown,
            reason: cache.audienceMatch,
            campaignSuggestions: cache.campaignSuggestions,
            estimatedReach: cache.estimatedReach,
            matchedAt: cache.matchedAt,
          };
        } else {
          // Generate real AI match
          const aiResult = await analyzeBrandCompatibility(myProfile as any, { ...profile, brandId } as any);
          
          // Save to cache
          const newCache = await BrandMatchCache.findOneAndUpdate(
            { brandA: uid, brandB: profile.userId },
            {
              compatibilityScore: aiResult.compatibilityScore,
              scoreBreakdown: aiResult.scoreBreakdown,
              audienceMatch: aiResult.audienceMatch,
              campaignSuggestions: aiResult.campaignSuggestions,
              marketingStrategy: aiResult.marketingStrategy,
              suggestedFreelancerCategories: aiResult.suggestedFreelancerCategories,
              estimatedReach: aiResult.estimatedReach,
              matchedAt: new Date(),
            },
            { upsert: true, returnDocument: 'after' }
          );

          matchData = {
            brandId,
            companyName: profile.companyName,
            logo: profile.logo,
            industry: profile.industry,
            compatibilityScore: newCache.compatibilityScore,
            scoreBreakdown: newCache.scoreBreakdown,
            reason: newCache.audienceMatch,
            campaignSuggestions: newCache.campaignSuggestions,
            estimatedReach: newCache.estimatedReach,
            matchedAt: newCache.matchedAt,
          };
        }

        return { ...matchData, isSaved, isRequested };
      })
    );

    return NextResponse.json({
      matches: resolvedMatches,
      total: candidateProfiles.length,
      page,
      pages: Math.ceil(candidateProfiles.length / limit)
    });
  } catch (error) {
    console.error("Matches API Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
