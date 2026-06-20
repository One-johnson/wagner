import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";

const INVENTORY_TABLES = [
  "activeCheckouts",
  "toolTransactions",
  "tools",
  "technicians",
  "toolCategories",
] as const;

const DEMO_ASSET_TAG_PREFIX = "WGV-";
const DEMO_EMPLOYEE_CODE_PREFIX = "TECH00";
const DEMO_CATEGORIES = new Set([
  "Hand Tools",
  "Power Tools",
  "Diagnostic",
  "Lifting",
  "Safety",
]);

export const clearAll = mutation({
  args: {
    sessionToken: v.string(),
    confirm: v.literal("CLEAR_ALL_INVENTORY"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const deleted: Record<string, number> = {};

    for (const table of INVENTORY_TABLES) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      deleted[table] = docs.length;
    }

    return { deleted };
  },
});

export const hasDemoData = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const demoTools = (await ctx.db.query("tools").collect()).filter((tool) =>
      tool.assetTag.startsWith(DEMO_ASSET_TAG_PREFIX)
    ).length;

    const demoTechnicians = (await ctx.db.query("technicians").collect()).filter(
      (tech) => tech.employeeCode.startsWith(DEMO_EMPLOYEE_CODE_PREFIX)
    ).length;

    return {
      hasDemo: demoTools > 0 || demoTechnicians > 0,
      demoTools,
      demoTechnicians,
    };
  },
});

export const clearDemoData = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const demoToolIds = new Set<string>();
    for (const tool of await ctx.db.query("tools").collect()) {
      if (tool.assetTag.startsWith(DEMO_ASSET_TAG_PREFIX)) {
        demoToolIds.add(tool._id);
        await ctx.db.delete(tool._id);
      }
    }

    for (const checkout of await ctx.db.query("activeCheckouts").collect()) {
      if (demoToolIds.has(checkout.toolId)) {
        await ctx.db.delete(checkout._id);
      }
    }

    for (const tx of await ctx.db.query("toolTransactions").collect()) {
      if (demoToolIds.has(tx.toolId)) {
        await ctx.db.delete(tx._id);
      }
    }

    let techniciansRemoved = 0;
    for (const tech of await ctx.db.query("technicians").collect()) {
      if (tech.employeeCode.startsWith(DEMO_EMPLOYEE_CODE_PREFIX)) {
        await ctx.db.delete(tech._id);
        techniciansRemoved += 1;
      }
    }

    let categoriesRemoved = 0;
    for (const category of await ctx.db.query("toolCategories").collect()) {
      if (DEMO_CATEGORIES.has(category.name)) {
        await ctx.db.delete(category._id);
        categoriesRemoved += 1;
      }
    }

    return {
      toolsRemoved: demoToolIds.size,
      techniciansRemoved,
      categoriesRemoved,
    };
  },
});
