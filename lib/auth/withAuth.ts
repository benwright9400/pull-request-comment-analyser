import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";

export type AuthedSession = Session & {
  user: Session["user"] & { githubId: string };
};

export function withAuth<Context = unknown>(
  handler: (req: NextRequest, session: AuthedSession, context: Context) => Promise<Response>
) {
  return async (req: NextRequest, context: Context) => {
    const session = await getServerSession(authOptions);

    if (!session?.user.githubId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    return handler(req, session as AuthedSession, context);
  };
}
