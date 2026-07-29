import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { createAnalysedRepository } from "@/lib/data/database/repositories/AnalysedRepositoryRepository";
import { isAnalysisSessionOwnedByAccount } from "@/lib/data/database/repositories/PRAnalysisSessionRepository";

export const POST = withAuth(async (req: NextRequest, session) => {
  const body = await req.json();

  if (!body.analysisId || typeof body.analysisId !== "string") {
    return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  }

  if (typeof body.repositoryId !== "number") {
    return NextResponse.json({ error: "repositoryId is required" }, { status: 400 });
  }

  if (!body.name || !body.fullName || !body.ownerLogin) {
    return NextResponse.json({ error: "name, fullName and ownerLogin are required" }, { status: 400 });
  }

  if (!(await isAnalysisSessionOwnedByAccount(body.analysisId, session.user.githubId))) {
    return NextResponse.json({ error: "Analysis session not found" }, { status: 403 });
  }

  try {
    const analysedRepository = await createAnalysedRepository(
      body.analysisId,
      body.repositoryId,
      body.name,
      body.fullName,
      body.ownerLogin,
      session.user.githubId
    );
    return NextResponse.json(analysedRepository, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
