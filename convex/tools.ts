import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";
import { toolStatusValidator } from "./schema";

export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const tools = await ctx.db.query("tools").collect();
    const categories = await ctx.db.query("toolCategories").collect();
    const categoryMap = new Map(
      categories.map((c) => [String(c._id), c.name] as const)
    );

    const rows = await Promise.all(
      tools.map(async (tool) => ({
        _id: tool._id,
        name: tool.name,
        assetTag: tool.assetTag,
        barcode: tool.barcode ?? null,
        photoId: tool.photoId ?? null,
        photoUrl: tool.photoId ? await ctx.storage.getUrl(tool.photoId) : null,
        categoryId: tool.categoryId ?? null,
        categoryName: tool.categoryId
          ? (categoryMap.get(String(tool.categoryId)) ?? null)
          : null,
        status: tool.status,
        conditionNotes: tool.conditionNotes ?? null,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt,
      }))
    );

    return rows.sort((a, b) => a.assetTag.localeCompare(b.assetTag));
  },
});

export const get = query({
  args: { sessionToken: v.string(), toolId: v.id("tools") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) return null;

    let categoryName: string | null = null;
    if (tool.categoryId) {
      const category = await ctx.db.get(tool.categoryId);
      categoryName = category?.name ?? null;
    }

    return {
      ...tool,
      categoryName,
      barcode: tool.barcode ?? null,
      conditionNotes: tool.conditionNotes ?? null,
    };
  },
});

export const listAvailable = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();
    return tools.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    assetTag: v.string(),
    barcode: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    categoryId: v.optional(v.id("toolCategories")),
    conditionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const assetTag = args.assetTag.trim().toUpperCase();
    const existing = await ctx.db
      .query("tools")
      .withIndex("by_asset_tag", (q) => q.eq("assetTag", assetTag))
      .unique();
    if (existing) throw new Error("Asset tag already exists");

    const now = Date.now();
    return await ctx.db.insert("tools", {
      name: args.name.trim(),
      assetTag,
      barcode: args.barcode?.trim() || undefined,
      photoId: args.photoId,
      categoryId: args.categoryId,
      status: "available",
      conditionNotes: args.conditionNotes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    toolId: v.id("tools"),
    name: v.optional(v.string()),
    assetTag: v.optional(v.string()),
    barcode: v.optional(v.string()),
    photoId: v.optional(v.union(v.id("_storage"), v.null())),
    categoryId: v.optional(v.id("toolCategories")),
    status: v.optional(toolStatusValidator),
    conditionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) throw new Error("Tool not found");

    if (args.assetTag && args.assetTag.trim().toUpperCase() !== tool.assetTag) {
      const existing = await ctx.db
        .query("tools")
        .withIndex("by_asset_tag", (q) =>
          q.eq("assetTag", args.assetTag!.trim().toUpperCase())
        )
        .unique();
      if (existing) throw new Error("Asset tag already exists");
    }

    if (args.status === "available" && tool.status === "checked_out") {
      throw new Error("Cannot set status to available while tool is checked out. Record a return first.");
    }

    await ctx.db.patch(args.toolId, {
      ...(args.name !== undefined ? { name: args.name.trim() } : {}),
      ...(args.assetTag !== undefined
        ? { assetTag: args.assetTag.trim().toUpperCase() }
        : {}),
      ...(args.barcode !== undefined
        ? { barcode: args.barcode.trim() || undefined }
        : {}),
      ...(args.photoId !== undefined
        ? { photoId: args.photoId ?? undefined }
        : {}),
      ...(args.categoryId !== undefined ? { categoryId: args.categoryId } : {}),
      ...(args.status !== undefined ? { status: args.status } : {}),
      ...(args.conditionNotes !== undefined
        ? { conditionNotes: args.conditionNotes.trim() || undefined }
        : {}),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const tool = await ctx.db.get(args.toolId);
    if (!tool) throw new Error("Tool not found");

    if (tool.status === "checked_out") {
      throw new Error("Cannot delete a checked-out tool. Record a return first.");
    }

    const activeCheckout = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .unique();
    if (activeCheckout) {
      throw new Error("Cannot delete a tool with an active checkout.");
    }

    const transaction = await ctx.db
      .query("toolTransactions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .first();
    if (transaction) {
      throw new Error("Cannot delete a tool that has transaction history.");
    }

    await ctx.db.delete(args.toolId);
  },
});

export const listCategoriesWithSummary = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const categories = await ctx.db.query("toolCategories").collect();
    const tools = await ctx.db.query("tools").collect();

    return categories
      .map((category) => {
        const categoryTools = tools.filter((t) => t.categoryId === category._id);
        return {
          _id: category._id,
          name: category.name,
          createdAt: category.createdAt,
          toolCount: categoryTools.length,
          tools: categoryTools
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 4)
            .map((t) => ({ name: t.name, assetTag: t.assetTag })),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const listCategories = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const categories = await ctx.db.query("toolCategories").collect();
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const createCategory = mutation({
  args: { sessionToken: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const name = args.name.trim();
    if (!name) throw new Error("Category name is required");

    const existing = await ctx.db
      .query("toolCategories")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
    if (existing) throw new Error("Category already exists");

    return await ctx.db.insert("toolCategories", {
      name,
      createdAt: Date.now(),
    });
  },
});

export const removeCategory = mutation({
  args: {
    sessionToken: v.string(),
    categoryId: v.id("toolCategories"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    const tool = await ctx.db
      .query("tools")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .first();
    if (tool) {
      throw new Error("Cannot delete a category that is assigned to tools.");
    }

    await ctx.db.delete(args.categoryId);
  },
});
