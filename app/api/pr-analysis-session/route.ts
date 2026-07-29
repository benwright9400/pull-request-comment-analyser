import { NextRequest, NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { withAuth } from "@/lib/auth/withAuth";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";
import {
  createPRAnalysisSession,
  completePRAnalysisSession,
} from "@/lib/data/database/repositories/PRAnalysisSessionRepository";
import runPRAgentAnalysis from "@/lib/business/pr-analysis/RunPRAgentAnalysis";

export const POST = withAuth(async (req: NextRequest, session) => {
  const body = await req.json();

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const sessionId = createId();
  const date = new Date().toISOString();

  await createPRAnalysisSession(sessionId, body.name, date, session.user.githubId);

  const analysisSession: PRAnalysisSession = {
    sessionId,
    name: body.name,
    date,
    complete: false,
    agentStatus: "pending",
  };

  return NextResponse.json(analysisSession, { status: 201 });
});

export const PATCH = withAuth(async (req: NextRequest, session) => {
  const body = await req.json();

  if (!body.sessionId || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const updated = await completePRAnalysisSession(body.sessionId, session.user.githubId);

  if (!updated) {
    return NextResponse.json({ error: "Analysis session not found" }, { status: 404 });
  }

  // Fire-and-forget: the server is persistent, so this keeps running after the response returns.
  void runPRAgentAnalysis(updated.sessionId, session.user.githubId, updated.name);

  const analysisSession: PRAnalysisSession = {
    sessionId: updated.sessionId,
    name: updated.name,
    date: updated.date.toISOString(),
    complete: updated.complete,
    agentStatus: updated.agentStatus,
  };

  return NextResponse.json(analysisSession);
});
