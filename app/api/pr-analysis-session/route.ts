import { NextRequest, NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { withAuth } from "@/lib/auth/withAuth";
import { PRAnalysisSession } from "@/types/PRAnalysisSession";

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();

  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const analysisSession: PRAnalysisSession = {
    sessionId: createId(),
    name: body.name,
    date: new Date().toISOString(),
    complete: false,
  };

  return NextResponse.json(analysisSession, { status: 201 });
});

export const PATCH = withAuth(async (req: NextRequest) => {
  const body = await req.json();

  if (!body.sessionId || typeof body.sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const analysisSession: PRAnalysisSession = {
    sessionId: body.sessionId,
    name: body.name,
    date: body.date,
    complete: true,
  };

  return NextResponse.json(analysisSession);
});
