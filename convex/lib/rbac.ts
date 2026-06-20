import type { Doc } from "../_generated/dataModel";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";
import { getSessionByToken } from "./session";

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

export type UserRole = Doc<"users">["role"];

export type AuthUser = {
  _id: Doc<"users">["_id"];
  email: string;
  name: string;
  role: UserRole;
};

export async function getAuthUser(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined
): Promise<AuthUser | null> {
  if (!sessionToken) return null;

  const session = await getSessionByToken(ctx, sessionToken);
  if (!session) return null;

  const user = await ctx.db.get(session.userId);
  if (!user || !user.isActive) return null;

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined
): Promise<AuthUser> {
  const user = await getAuthUser(ctx, sessionToken);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | null | undefined
): Promise<AuthUser> {
  const user = await requireAuth(ctx, sessionToken);
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}
