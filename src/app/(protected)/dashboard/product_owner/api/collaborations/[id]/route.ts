import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  requireProductOwnerAuth,
  jsonError,
  parseBody,
} from "../../../lib/api-utils";
import { productOwnerCollaborationUpdateSchema } from "../../../lib/validators";
import ProductOwnerCollaborationRequest from "../../../_models/ProductOwnerCollaborationRequest";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const result = await requireProductOwnerAuth();
    if ("error" in result) return result.error;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(productOwnerCollaborationUpdateSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();
    const collaboration = await ProductOwnerCollaborationRequest.findOneAndUpdate(
      {
        _id: id,
        $or: [{ userId: result.auth.userId }, { partnerId: result.auth.userId }],
      },
      { $set: { status: parsed.data!.status } },
      { new: true },
    )
      .populate("partnerId", "name")
      .populate("productId", "name");

    if (!collaboration) return jsonError("Collaboration not found", 404);

    return NextResponse.json({ collaboration });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
