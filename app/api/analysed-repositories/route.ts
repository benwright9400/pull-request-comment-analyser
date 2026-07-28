import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createAnalysedRepository } from "@/lib/data/database/repositories/AnalysedRepositoryRepository";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.githubId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

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
}
