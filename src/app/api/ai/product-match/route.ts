import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError } from "@/lib/api-utils";
import { rankBrandsForProduct } from "@/lib/ai/matching";
import Product from "@/models/Product";
import Profile from "@/models/Profile";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const { productId } = await request.json();
    if (!productId) return jsonError("productId required");

    await connectDB();
    const product = await Product.findOne({ _id: productId, userId: result.auth.userId });
    if (!product) return jsonError("Product not found", 404);

    const brandProfiles = await Profile.find({ role: "brand", profileComplete: true });
    const brands = await Promise.all(
      brandProfiles.map(async (p) => {
        const u = await User.findById(p.userId).select("name");
        return {
          brandId: p.userId.toString(),
          companyName: p.companyName,
          industry: p.industry,
          targetAudience: p.targetAudience,
          marketingBudget: p.marketingBudget,
          bio: p.bio,
          name: u?.name,
        };
      }),
    );

    const matches = await rankBrandsForProduct(
      {
        name: product.name,
        description: product.description,
        category: product.category,
        targetAudience: product.targetAudience,
      },
      brands,
    );

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
