import { NextResponse } from "next/server";
import { getServerSessionUser, getSessionTokenFromCookies } from "@/lib/auth/session-server";

export async function GET() {
  const token = await getSessionTokenFromCookies();
  if (!token) {
    return NextResponse.json({ token: null, user: null });
  }

  const user = await getServerSessionUser();
  if (!user) {
    return NextResponse.json({ token: null, user: null });
  }

  return NextResponse.json({ token, user });
}
