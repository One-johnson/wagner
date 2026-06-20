import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import {
  BROWSER_SESSION_MAX_AGE,
  REMEMBER_ME_MAX_AGE,
} from "@/lib/auth/constants";
import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/auth/cookie";
import { getFriendlyAuthErrorMessage } from "@/lib/friendly-errors";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return NextResponse.json(
      { error: "Convex is not configured" },
      { status: 503 }
    );
  }

  let body: { email?: string; password?: string; rememberMe?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;
  const rememberMe = body.rememberMe === true;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim();

  const client = new ConvexHttpClient(url);
  try {
    const result = await client.mutation(api.auth.login, {
      email,
      password,
      rememberMe,
      userAgent,
      ipAddress,
    });

    const response = NextResponse.json({
      user: result.user,
      sessionToken: result.sessionToken,
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      result.sessionToken,
      sessionCookieOptions(
        rememberMe ? REMEMBER_ME_MAX_AGE : BROWSER_SESSION_MAX_AGE
      )
    );

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json(
      { error: getFriendlyAuthErrorMessage(message) },
      { status: 401 }
    );
  }
}
