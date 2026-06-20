import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";

export const list = query({
  args: {
    sessionToken: v.string(),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    let transactions = await ctx.db.query("toolTransactions").collect();

    if (args.fromDate) {
      transactions = transactions.filter((t) => t.occurredAt >= args.fromDate!);
    }
    if (args.toDate) {
      transactions = transactions.filter((t) => t.occurredAt <= args.toDate!);
    }

    const rows = await Promise.all(
      transactions.map(async (tx) => {
        const tool = await ctx.db.get(tx.toolId);
        const technician = await ctx.db.get(tx.technicianId);
        const user = await ctx.db.get(tx.performedByUserId);
        return {
          _id: tx._id,
          type: tx.type,
          occurredAt: tx.occurredAt,
          notes: tx.notes ?? null,
          conditionAtEvent: tx.conditionAtEvent ?? null,
          toolId: tx.toolId,
          toolName: tool?.name ?? "Unknown",
          assetTag: tool?.assetTag ?? "—",
          technicianId: tx.technicianId,
          technicianName: technician?.name ?? "Unknown",
          employeeCode: technician?.employeeCode ?? "—",
          performedByName: user?.name ?? "Unknown",
        };
      })
    );

    return rows.sort((a, b) => b.occurredAt - a.occurredAt);
  },
});

export const listByTool = query({
  args: { sessionToken: v.string(), toolId: v.id("tools") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const transactions = await ctx.db
      .query("toolTransactions")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .collect();

    const rows = await Promise.all(
      transactions.map(async (tx) => {
        const technician = await ctx.db.get(tx.technicianId);
        const user = await ctx.db.get(tx.performedByUserId);
        return {
          _id: tx._id,
          type: tx.type,
          occurredAt: tx.occurredAt,
          notes: tx.notes ?? null,
          conditionAtEvent: tx.conditionAtEvent ?? null,
          technicianName: technician?.name ?? "Unknown",
          performedByName: user?.name ?? "Unknown",
        };
      })
    );

    return rows.sort((a, b) => b.occurredAt - a.occurredAt);
  },
});
