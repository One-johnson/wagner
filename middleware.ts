import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/login";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (pathname === "/admin/setup" || pathname.startsWith("/admin/setup/")) {
      return NextResponse.next();
    }
    if (!session) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
