import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, clearedSessionCookie } from "@/lib/auth/cookie";

export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(SESSION_COOKIE_NAME, "", clearedSessionCookie());
  return response;
}
