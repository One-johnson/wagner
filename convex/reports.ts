import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/rbac";

const DAY_MS = 24 * 60 * 60 * 1000;

export const getMostBorrowedTools = query({
  args: {
    sessionToken: v.string(),
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const days = args.days ?? 90;
    const limit = args.limit ?? 10;
    const since = Date.now() - days * DAY_MS;

    const transactions = await ctx.db
      .query("toolTransactions")
      .withIndex("by_occurred_at", (q) => q.gte("occurredAt", since))
      .collect();

    const counts = new Map<string, { toolId: string; checkouts: number }>();
    for (const tx of transactions) {
      if (tx.type !== "checkout") continue;
      const key = tx.toolId;
      const entry = counts.get(key) ?? { toolId: key, checkouts: 0 };
      entry.checkouts += 1;
      counts.set(key, entry);
    }

    const sorted = Array.from(counts.values()).sort((a, b) => b.checkouts - a.checkouts);
    const top = sorted.slice(0, limit);

    return Promise.all(
      top.map(async (item) => {
        const tool = await ctx.db.get(item.toolId as Id<"tools">);
        return {
          toolId: item.toolId,
          name: tool?.name ?? "Unknown",
          assetTag: tool?.assetTag ?? "—",
          status: tool?.status ?? "available",
          checkouts: item.checkouts,
        };
      })
    );
  },
});

export const getTechnicianBorrowingStats = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const now = Date.now();

    const technicians = await ctx.db.query("technicians").collect();
    const transactions = await ctx.db.query("toolTransactions").collect();
    const checkouts = await ctx.db.query("activeCheckouts").collect();

    const checkoutCounts = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== "checkout") continue;
      const key = tx.technicianId;
      checkoutCounts.set(key, (checkoutCounts.get(key) ?? 0) + 1);
    }

    const activeByTech = new Map<string, number>();
    const overdueByTech = new Map<string, number>();
    for (const checkout of checkouts) {
      const key = checkout.technicianId;
      activeByTech.set(key, (activeByTech.get(key) ?? 0) + 1);
      if (checkout.dueAt && checkout.dueAt < now) {
        overdueByTech.set(key, (overdueByTech.get(key) ?? 0) + 1);
      }
    }

    return technicians
      .map((tech) => ({
        technicianId: tech._id,
        name: tech.name,
        employeeCode: tech.employeeCode,
        isActive: tech.isActive,
        totalCheckouts: checkoutCounts.get(tech._id) ?? 0,
        activeCheckouts: activeByTech.get(tech._id) ?? 0,
        overdueCheckouts: overdueByTech.get(tech._id) ?? 0,
      }))
      .filter((t) => t.totalCheckouts > 0 || t.activeCheckouts > 0)
      .sort((a, b) => b.totalCheckouts - a.totalCheckouts);
  },
});

export const getConditionSummary = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const tools = await ctx.db.query("tools").collect();
    const transactions = await ctx.db.query("toolTransactions").collect();

    const lostTools = tools
      .filter((t) => t.status === "lost")
      .map((t) => ({
        _id: t._id,
        name: t.name,
        assetTag: t.assetTag,
        conditionNotes: t.conditionNotes ?? null,
      }));

    const maintenanceTools = tools
      .filter((t) => t.status === "maintenance")
      .map((t) => ({
        _id: t._id,
        name: t.name,
        assetTag: t.assetTag,
        conditionNotes: t.conditionNotes ?? null,
      }));

    const poorConditionReturns = transactions
      .filter(
        (tx) =>
          tx.type === "return" &&
          (tx.conditionAtEvent === "poor" || tx.conditionAtEvent === "damaged")
      )
      .sort((a, b) => b.occurredAt - a.occurredAt)
      .slice(0, 20);

    const returnDetails = await Promise.all(
      poorConditionReturns.map(async (tx) => {
        const tool = await ctx.db.get(tx.toolId);
        const technician = await ctx.db.get(tx.technicianId);
        return {
          _id: tx._id,
          occurredAt: tx.occurredAt,
          condition: tx.conditionAtEvent ?? "poor",
          toolName: tool?.name ?? "Unknown",
          assetTag: tool?.assetTag ?? "—",
          technicianName: technician?.name ?? "Unknown",
          notes: tx.notes ?? null,
        };
      })
    );

    return {
      lostCount: lostTools.length,
      maintenanceCount: maintenanceTools.length,
      poorReturnCount: returnDetails.length,
      lostTools,
      maintenanceTools,
      poorReturns: returnDetails,
    };
  },
});
