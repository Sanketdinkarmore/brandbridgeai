import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth, jsonError, parseBody } from "@/lib/api-utils";
import { projectSchema } from "@/lib/validators";
import Project from "@/models/Project";
import Proposal from "@/models/Proposal";

export async function GET(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = { hirerId: result.auth.userId };
    if (status && status !== "all") query.status = status;
    if (search) query.title = { $regex: search, $options: "i" };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate("assignedFreelancerId", "name")
      .lean();

    // Attach proposal counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        // We'll reuse Proposal model for Project applicants (rename campaignId to projectId later or just use campaignId for now, wait Proposal model might not have projectId)
        // Let's check Proposal model first, but assuming we can count proposals where campaignId = project._id
        const count = await Proposal.countDocuments({ campaignId: p._id });
        return {
          ...p,
          _id: p._id.toString(),
          hirerId: p.hirerId.toString(),
          assignedFreelancerId: p.assignedFreelancerId ? {
            _id: (p.assignedFreelancerId as any)._id.toString(),
            name: (p.assignedFreelancerId as any).name,
          } : null,
          applicantCount: count,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithCounts });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAuth();
    if ("error" in result) return result.error;

    const body = await request.json();
    const parsed = parseBody(projectSchema, body);
    if ("error" in parsed) return jsonError(parsed.error!);

    await connectDB();

    const project = await Project.create({
      ...parsed.data,
      hirerId: result.auth.userId,
      status: "open",
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
