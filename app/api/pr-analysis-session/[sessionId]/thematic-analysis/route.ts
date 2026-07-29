import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { getPRThematicAnalysisForAccount } from "@/lib/data/database/repositories/PRThematicAnalysisRepository";

export const GET = withAuth<{ params: Promise<{ sessionId: string }> }>(
  async (req: NextRequest, session, { params }) => {
    const { sessionId } = await params;

    const result = await getPRThematicAnalysisForAccount(sessionId, session.user.githubId);

    if (!result) {
      return NextResponse.json({ error: "Thematic analysis not found" }, { status: 404 });
    }

    return NextResponse.json({
      analysisId: result.analysisId,
      summary: result.summary,
      codes: result.codes,
      themes: result.themes,
    });
  }
);
