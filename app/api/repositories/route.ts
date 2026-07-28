import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";
import { listRepositories } from "@/lib/data/services/github";

export const GET = withAuth(async (req, session) => {
  if (!session.user.githubAccessToken) {
    return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
  }

  try {
    const repositories = await listRepositories(session.user.githubAccessToken);
    return NextResponse.json({ repositories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
});
