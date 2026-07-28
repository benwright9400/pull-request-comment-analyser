import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      googleSub?: string | unknown;
      githubAccessToken?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    googleSub?: string;
    githubAccessToken?: string;
  }
}
