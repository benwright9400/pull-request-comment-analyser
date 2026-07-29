import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { createAnalysedComment } from "@/lib/data/database/repositories/AnalysedCommentRepository";
import { isAnalysisSessionOwnedByAccount } from "@/lib/data/database/repositories/PRAnalysisSessionRepository";

export const POST = withAuth(async (req: NextRequest, session) => {
  const body = await req.json();

  if (!body.analysisId || typeof body.analysisId !== "string") {
    return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  }

  if (
    typeof body.repositoryId !== "number" ||
    typeof body.pullRequestId !== "number" ||
    typeof body.commentId !== "number"
  ) {
    return NextResponse.json(
      { error: "repositoryId, pullRequestId and commentId are required" },
      { status: 400 }
    );
  }

  if (!(await isAnalysisSessionOwnedByAccount(body.analysisId, session.user.githubId))) {
    return NextResponse.json({ error: "Analysis session not found" }, { status: 403 });
  }

  try {
    const analysedComment = await createAnalysedComment(
      body.analysisId,
      body.repositoryId,
      body.pullRequestId,
      body.commentId,
      body.body,
      body.authorLogin,
      body.diffHunk,
      body.path,
      body.inReplyToId,
      body.githubCreatedAt,
      session.user.githubId
    );
    return NextResponse.json(analysedComment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
