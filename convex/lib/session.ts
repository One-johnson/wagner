import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Id } from "../_generated/dataModel";

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const REMEMBER_ME_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

export async function hashSessionToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

export async function createSession(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    sessionToken: string;
    userAgent?: string;
    ipAddress?: string;
    rememberMe?: boolean;
  }
) {
  const now = Date.now();
  const ttlMs = args.rememberMe ? REMEMBER_ME_TTL_MS : SESSION_TTL_MS;
  const tokenHash = await hashSessionToken(args.sessionToken);
  return await ctx.db.insert("sessions", {
    userId: args.userId,
    tokenHash,
    expiresAt: now + ttlMs,
    createdAt: now,
    lastUsedAt: now,
    userAgent: args.userAgent,
    ipAddress: args.ipAddress,
  });
}

export async function getSessionByToken(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string
) {
  const tokenHash = await hashSessionToken(sessionToken);
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .unique();

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
}

export async function deleteSessionByToken(
  ctx: MutationCtx,
  sessionToken: string
) {
  const session = await getSessionByToken(ctx, sessionToken);
  if (session) {
    await ctx.db.delete(session._id);
  }
}
