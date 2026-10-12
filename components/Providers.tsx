"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Wraps children with NextAuth's SessionProvider so client-side
 * hooks (useSession, signIn, signOut) work throughout the app.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
