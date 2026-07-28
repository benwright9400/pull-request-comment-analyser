import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { listComments } from "@/lib/data/services/github";

export async function GET(
  req: NextRequest,
  { params }: { params: { number: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user.githubAccessToken) {
    return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const pullNumber = Number(params.number);

  if (!owner || !repo || !Number.isInteger(pullNumber)) {
    return NextResponse.json({ error: "owner, repo and a numeric pull request number are required" }, { status: 400 });
  }

  try {
    const comments = await listComments(session.user.githubAccessToken, owner, repo, pullNumber);
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
