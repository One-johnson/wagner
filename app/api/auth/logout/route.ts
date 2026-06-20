import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { SESSION_COOKIE_NAME, clearedSessionCookie } from "@/lib/auth/cookie";
import { getSessionTokenFromCookies } from "@/lib/auth/session-server";

export async function POST() {
  const token = await getSessionTokenFromCookies();
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (token && url) {
    const client = new ConvexHttpClient(url);
    try {
      await client.mutation(api.auth.logout, { sessionToken: token });
    } catch {
      // Still clear cookie
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", clearedSessionCookie());
  return response;
}
