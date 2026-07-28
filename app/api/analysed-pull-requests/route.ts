import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createAnalysedPullRequest } from "@/lib/data/database/repositories/AnalysedPullRequestRepository";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.githubId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.analysisId || typeof body.analysisId !== "string") {
    return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  }

  if (typeof body.repositoryId !== "number" || typeof body.pullRequestId !== "number") {
    return NextResponse.json({ error: "repositoryId and pullRequestId are required" }, { status: 400 });
  }

  if (typeof body.number !== "number" || !body.title || !body.state) {
    return NextResponse.json({ error: "number, title and state are required" }, { status: 400 });
  }

  try {
    const analysedPullRequest = await createAnalysedPullRequest(
      body.analysisId,
      body.repositoryId,
      body.pullRequestId,
      body.number,
      body.title,
      body.state,
      body.body ?? null,
      body.githubCreatedAt,
      body.githubUpdatedAt,
      session.user.githubId
    );
    return NextResponse.json(analysedPullRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
