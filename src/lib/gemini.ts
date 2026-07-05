import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

/** After a 429, skip Gemini calls for this long to avoid log spam and slow requests */
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000;
let quotaBlockedUntil = 0;

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey);
}

export function isGeminiQuotaBlocked(): boolean {
  return Date.now() < quotaBlockedUntil;
}

export function getGeminiQuotaRetryAfterMs(): number {
  return Math.max(0, quotaBlockedUntil - Date.now());
}

export function isGeminiAvailable(): boolean {
  return isGeminiConfigured() && !isGeminiQuotaBlocked();
}

const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

const MODEL_FALLBACKS = [
  GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((model, index, list) => list.indexOf(model) === index);

function markQuotaBlocked() {
  quotaBlockedUntil = Date.now() + QUOTA_COOLDOWN_MS;
}

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { status?: number; message?: string };
  return e.status === 429 || String(e.message ?? "").includes("429") || String(e.message ?? "").toLowerCase().includes("quota");
}

export function getGeminiModel(modelName = GEMINI_MODEL) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Calls Gemini. Returns empty string if unavailable, quota exceeded, or on error.
 * Does not throw — callers should use local fallbacks.
 */
export async function generateText(prompt: string): Promise<string> {
  if (!isGeminiAvailable()) {
    return "";
  }

  let lastErr: unknown;
  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = getGeminiModel(modelName);
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      if (isQuotaError(err)) break;
    }
  }

  if (isQuotaError(lastErr)) {
    markQuotaBlocked();
    console.warn(
      "[Gemini] Quota exceeded — using fallback data for ~5 minutes. Check billing at https://ai.google.dev/gemini-api/docs/rate-limits",
    );
  } else {
    console.error("[generateText] Error:", lastErr);
  }
  return "";
}
