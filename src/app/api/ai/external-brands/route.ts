import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import Profile from "@/models/Profile";
import {
  discoverExternalBrands,
  type ExternalBrandDiscoveryResult,
} from "@/lib/ai/matching";
import { getGeminiQuotaRetryAfterMs, isGeminiConfigured } from "@/lib/gemini";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = ExternalBrandDiscoveryResult & { expiresAt: number };
const recommendationCache = new Map<string, CacheEntry>();

function profileCacheKey(
  userId: string,
  profile: {
    companyName?: string;
    industry?: string;
    targetAudience?: string;
    marketingBudget?: number;
    bio?: string;
    location?: string;
  },
) {
  const fingerprint = JSON.stringify({
    companyName: profile.companyName ?? "",
    industry: profile.industry ?? "",
    targetAudience: profile.targetAudience ?? "",
    marketingBudget: profile.marketingBudget ?? 0,
    bio: profile.bio ?? "",
    location: profile.location ?? "",
  });
  return `${userId}:${createHash("sha256").update(fingerprint).digest("hex").slice(0, 16)}`;
}

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const refresh = new URL(request.url).searchParams.get("refresh") === "true";

    await connectDB();
    const myProfile = await Profile.findOne({ userId: result.auth.userId });
    if (!myProfile) return jsonError("Complete your profile first", 400);

    const brandInput = {
      companyName: myProfile.companyName,
      industry: myProfile.industry,
      targetAudience: myProfile.targetAudience,
      marketingBudget: myProfile.marketingBudget,
      bio: myProfile.bio,
      location: myProfile.location,
    };

    const cacheKey = profileCacheKey(result.auth.userId, brandInput);
    const cached = recommendationCache.get(cacheKey);
    if (!refresh && cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({
        recommendations: cached.recommendations,
        source: cached.source,
        quotaBlocked: cached.quotaBlocked,
        cached: true,
        aiPowered: isGeminiConfigured(),
        quotaRetryAfterMs: getGeminiQuotaRetryAfterMs(),
      });
    }

    const discovery = await discoverExternalBrands(brandInput, { useAi: true });

    recommendationCache.set(cacheKey, {
      ...discovery,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({
      recommendations: discovery.recommendations,
      source: discovery.source,
      quotaBlocked: discovery.quotaBlocked,
      cached: false,
      aiPowered: isGeminiConfigured(),
      quotaRetryAfterMs: getGeminiQuotaRetryAfterMs(),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
