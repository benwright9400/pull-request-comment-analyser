import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createAnnotation } from "@/lib/data/database/repositories/AnnotationRepository";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.githubId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

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
}
