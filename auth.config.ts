import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth configuration.
 * Kept separate from auth.ts so that proxy.ts / middleware does not bundle
 * Node.js-only modules like `pg`, `bcryptjs`, or PrismaClient.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "EMPLOYEE";
        token.id = user.id ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
