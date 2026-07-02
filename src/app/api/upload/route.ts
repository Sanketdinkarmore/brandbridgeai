import { NextResponse } from "next/server";
import { requireAuth, jsonError } from "@/lib/api-utils";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return jsonError("No file provided");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({ url: base64, fallback: true });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import("crypto");
    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: dataUri,
          api_key: apiKey,
          timestamp,
          signature,
        }),
      },
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return jsonError(`Upload failed: ${err}`, 500);
    }

    const data = await uploadRes.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
