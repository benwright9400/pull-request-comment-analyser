import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Add Google sub ID to JWT on sign in
      if (account?.provider === "google" && profile) {
        token.googleSub = profile.sub;
      }
      // Add GitHub access token to JWT on sign in
      if (account?.provider === "github") {
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose Google sub ID and GitHub access token in session
      if (session.user) {
        session.user.googleSub = token.googleSub as string;
        session.user.githubAccessToken = token.githubAccessToken as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};