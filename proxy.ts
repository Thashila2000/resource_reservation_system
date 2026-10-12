/**
 * proxy.ts — Next.js 16 replacement for middleware.ts
 * Enforces RBAC: /admin/* routes require ADMIN role, /employee/* require EMPLOYEE.
 * Unauthenticated users hitting protected routes are redirected to /login.
 */
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((request) => {
  const session = request.auth;
  const { pathname } = request.nextUrl;

  // Public routes — always allowed
  const publicPaths = ["/", "/login", "/register", "/api/auth"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Not signed in — redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Admin routes — require ADMIN
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/employee/dashboard", request.url));
  }

  // Employee routes — require EMPLOYEE (admins can also access)
  if (pathname.startsWith("/employee") && role !== "EMPLOYEE" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all routes except:
     *  - _next/static, _next/image (static assets)
     *  - favicon.ico
     *  - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
