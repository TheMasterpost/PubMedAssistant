import NextAuth, { NextAuthOptions, Session, User, Account, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";

// Augment NextAuth Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Forces Google account selection
          access_type: "offline",   // Ensures refresh token for persistent access
          response_type: "code"     // Standard OAuth flow
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  // Optional: Customize pages if you want to redirect to signup explicitly
  pages: {
    signIn: "/signup", // Redirects to your custom signup page if sign-in fails
  },
  callbacks: {
    // Add user ID to session
    async session({ session, user }: { session: Session; user: User }): Promise<Session> {
      if (session.user && user.id) {
        session.user.id = user.id;
      }
      return session;
    },
    // Validate sign-in for Google and GitHub
    async signIn({ user, account, profile }: { 
      user: User; 
      account: Account | null; 
      profile?: Profile & { email_verified?: boolean } 
    }): Promise<boolean> {
      if (account?.provider === "google") {
        // Ensure Google email exists and is verified (optional stricter check)
        return !!(profile?.email && profile?.email_verified !== false);
      }
      if (account?.provider === "github") {
        // Basic GitHub validation (email must exist)
        return !!profile?.email;
      }
      return true; // Default allow for other providers
    },
  },
  debug: process.env.NODE_ENV === "development", // Helpful logs in dev
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };