import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { listRepositories } from "@/lib/data/services/github";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.githubAccessToken) {
    return NextResponse.json({ error: "GitHub account not connected" }, { status: 401 });
  }

  try {
    const repositories = await listRepositories(session.user.githubAccessToken);
    return NextResponse.json({ repositories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
