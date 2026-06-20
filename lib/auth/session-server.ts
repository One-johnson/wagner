import { cookies } from "next/headers";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { AdminUser } from "@/lib/auth/types";
import { SESSION_COOKIE_NAME } from "./constants";

export async function getSessionTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getServerSessionUser(): Promise<AdminUser | null> {
  const token = await getSessionTokenFromCookies();
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!token || !url) return null;

  const client = new ConvexHttpClient(url);
  try {
    const user = await client.query(api.auth.getCurrentUser, {
      sessionToken: token,
    });
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return null;
  }
}
