import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { listComments } from "@/lib/data/services/github";

export const GET = withAuth<{ params: Promise<{ number: string }> }>(
  async (req: NextRequest, session, { params }) => {
    if (!session.user.githubAccessToken) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const pullNumber = Number((await params).number);

    if (!owner || !repo || !Number.isInteger(pullNumber)) {
      return NextResponse.json(
        { error: "owner, repo and a numeric pull request number are required" },
        { status: 400 }
      );
    }

    try {
      const comments = await listComments(session.user.githubAccessToken, owner, repo, pullNumber);
      return NextResponse.json(comments);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
  }
);
