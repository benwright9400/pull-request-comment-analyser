import { NextRequest, NextResponse } from "next/server";

import { getPurposesByUri } from "@/lib/data/database/repositories/PurposeRepository";
import { getCodesByUri } from "@/lib/data/database/repositories/CodeRepository";
import { getThemesByUri } from "@/lib/data/database/repositories/ThemeRepository";
import { withAuth } from "@/lib/auth/withAuth";

export const GET = withAuth(async (req: NextRequest, session) => {
  const { searchParams } = new URL(req.url);
  let uri = searchParams.get("fileName");

  if (!uri) {
    return NextResponse.json({ error: "URI not provided" }, { status: 400 });
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
});
