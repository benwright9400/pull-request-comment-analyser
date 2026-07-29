import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { createAnnotation } from "@/lib/data/database/repositories/AnnotationRepository";
import { isAnalysisSessionOwnedByAccount } from "@/lib/data/database/repositories/PRAnalysisSessionRepository";

export const POST = withAuth(async (req: NextRequest, session) => {
  const body = await req.json();

  if (!body.text || typeof body.text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (typeof body.commentId !== "number") {
    return NextResponse.json({ error: "commentId is required" }, { status: 400 });
  }

  if (typeof body.repositoryId !== "number") {
    return NextResponse.json({ error: "repositoryId is required" }, { status: 400 });
  }

  if (!body.analysisId || typeof body.analysisId !== "string") {
    return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  }

  if (!(await isAnalysisSessionOwnedByAccount(body.analysisId, session.user.githubId))) {
    return NextResponse.json({ error: "Analysis session not found" }, { status: 403 });
  }

  try {
    const annotation = await createAnnotation(
      body.text,
      body.commentId,
      body.repositoryId,
      body.analysisId,
      session.user.githubId
    );
    return NextResponse.json(annotation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
