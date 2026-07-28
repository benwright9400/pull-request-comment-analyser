import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getPurposesByUri } from "@/lib/data/database/repositories/PurposeRepository";
import { getCodesByUri } from "@/lib/data/database/repositories/CodeRepository";
import { getThemesByUri } from "@/lib/data/database/repositories/ThemeRepository";
import { authOptions } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let uri = searchParams.get("fileName");

  if (!uri) {
    return NextResponse.json({ error: "URI not provided" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user.githubId || typeof session.user.githubId !== "string") {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  uri = session.user.githubId + "/" + uri;

  try {
    const [purposes, codes, themes] = await Promise.all([
      getPurposesByUri(uri),
      getCodesByUri(uri),
      getThemesByUri(uri),
    ]);

    return NextResponse.json({
      purpose: purposes.length > 0 ? purposes[0] : null, // assuming 1 purpose per file
      codes,
      themes,
    });
  } catch (error) {
    console.error("Error fetching purpose/codes/themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
