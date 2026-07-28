import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubId?: string;
      githubAccessToken?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    githubId?: string;
    githubAccessToken?: string;
  }
}
