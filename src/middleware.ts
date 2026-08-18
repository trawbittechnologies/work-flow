import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Redirect public registration attempt to login
  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/forgot-password", "/reset-password"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Allow API routes to handle their own auth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // Protect admin routes — only users with ADMIN role can access /admin/*
  if (pathname.startsWith("/admin")) {
    const role = (req.auth?.user as { role?: string })?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js)$).*)",
  ],
};
