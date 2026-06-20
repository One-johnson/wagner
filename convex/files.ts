import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";

export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: {
    sessionToken: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.storage.getUrl(args.storageId);
  },
});
