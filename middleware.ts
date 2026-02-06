import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authCookieName, isValidSession } from "@/lib/auth";

const protectedPaths = ["/", "/shortlist", "/events"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(authCookieName())?.value;
  if (isValidSession(token)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
