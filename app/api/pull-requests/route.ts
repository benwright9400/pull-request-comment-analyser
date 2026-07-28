import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { listPullRequests } from "@/lib/data/services/github";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.githubAccessToken) {
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
}
