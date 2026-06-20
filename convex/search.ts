import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";

export const globalSearch = query({
  args: {
    sessionToken: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const q = args.query.trim().toLowerCase();
    const limit = args.limit ?? 8;

    if (q.length < 2) {
      return { tools: [], technicians: [], categories: [] };
    }

    const tools = await ctx.db.query("tools").collect();
    const technicians = await ctx.db.query("technicians").collect();
    const categories = await ctx.db.query("toolCategories").collect();

    const toolMatches = tools
      .filter(
        (tool) =>
          tool.name.toLowerCase().includes(q) ||
          tool.assetTag.toLowerCase().includes(q) ||
          (tool.barcode?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, limit)
      .map((tool) => ({
        _id: tool._id,
        name: tool.name,
        assetTag: tool.assetTag,
        status: tool.status,
        href: "/admin/tools",
      }));

    const technicianMatches = technicians
      .filter(
        (tech) =>
          tech.name.toLowerCase().includes(q) ||
          tech.employeeCode.toLowerCase().includes(q)
      )
      .slice(0, limit)
      .map((tech) => ({
        _id: tech._id,
        name: tech.name,
        employeeCode: tech.employeeCode,
        isActive: tech.isActive,
        href: "/admin/technicians",
      }));

    const categoryMatches = categories
      .filter((cat) => cat.name.toLowerCase().includes(q))
      .slice(0, limit)
      .map((cat) => ({
        _id: cat._id,
        name: cat.name,
        href: "/admin/categories",
      }));

    return {
      tools: toolMatches,
      technicians: technicianMatches,
      categories: categoryMatches,
    };
  },
});
