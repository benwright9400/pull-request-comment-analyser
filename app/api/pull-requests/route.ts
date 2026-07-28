import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { listPullRequests } from "@/lib/data/services/github";

export const GET = withAuth(async (req: NextRequest, session) => {
  if (!session.user.githubAccessToken) {
    return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner") || undefined;
  const repo = searchParams.get("repo") || undefined;

  try {
    const pullRequests = await listPullRequests(session.user.githubAccessToken, owner, repo);
    return NextResponse.json({ pullRequests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
});
