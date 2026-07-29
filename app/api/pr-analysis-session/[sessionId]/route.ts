import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";
import { getPRAnalysisSessionForAccount } from "@/lib/data/database/repositories/PRAnalysisSessionRepository";

export const GET = withAuth<{ params: Promise<{ sessionId: string }> }>(
  async (req: NextRequest, session, { params }) => {
    const { sessionId } = await params;

    const found = await getPRAnalysisSessionForAccount(sessionId, session.user.githubId);

    if (!found) {
      return NextResponse.json({ error: "Analysis session not found" }, { status: 404 });
    }

    const analysisSession: PRAnalysisSession = {
      sessionId: found.sessionId,
      name: found.name,
      date: found.date.toISOString(),
      complete: found.complete,
      agentStatus: found.agentStatus,
    };

    return NextResponse.json(analysisSession);
  }
);
