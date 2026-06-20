import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";

export const getStats = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const tools = await ctx.db.query("tools").collect();
    const checkouts = await ctx.db.query("activeCheckouts").collect();
    const now = Date.now();

    const overdue = checkouts.filter((c) => c.dueAt && c.dueAt < now).length;

    return {
      total: tools.length,
      available: tools.filter((t) => t.status === "available").length,
      checkedOut: tools.filter((t) => t.status === "checked_out").length,
      maintenance: tools.filter((t) => t.status === "maintenance").length,
      lost: tools.filter((t) => t.status === "lost").length,
      retired: tools.filter((t) => t.status === "retired").length,
      activeCheckouts: checkouts.length,
      overdue,
      technicians: (await ctx.db.query("technicians").collect()).filter(
        (t) => t.isActive
      ).length,
    };
  },
});

export const getRecentActivity = query({
  args: { sessionToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const limit = args.limit ?? 10;

    const transactions = await ctx.db.query("toolTransactions").collect();
    const sorted = transactions.sort((a, b) => b.occurredAt - a.occurredAt).slice(0, limit);

    return Promise.all(
      sorted.map(async (tx) => {
        const tool = await ctx.db.get(tx.toolId);
        const technician = await ctx.db.get(tx.technicianId);
        return {
          _id: tx._id,
          type: tx.type,
          occurredAt: tx.occurredAt,
          toolName: tool?.name ?? "Unknown",
          assetTag: tool?.assetTag ?? "—",
          technicianName: technician?.name ?? "Unknown",
        };
      })
    );
  },
});

export const getOverdueCheckouts = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const now = Date.now();
    const checkouts = await ctx.db.query("activeCheckouts").collect();

    const overdue = checkouts.filter((c) => c.dueAt && c.dueAt < now);

    return Promise.all(
      overdue.map(async (checkout) => {
        const tool = await ctx.db.get(checkout.toolId);
        const technician = await ctx.db.get(checkout.technicianId);
        return {
          _id: checkout._id,
          toolName: tool?.name ?? "Unknown",
          assetTag: tool?.assetTag ?? "—",
          technicianName: technician?.name ?? "Unknown",
          employeeCode: technician?.employeeCode ?? "—",
          checkedOutAt: checkout.checkedOutAt,
          dueAt: checkout.dueAt!,
        };
      })
    );
  },
});

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDayLabel(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const getStatusBreakdown = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const tools = await ctx.db.query("tools").collect();

    const counts = {
      available: 0,
      checked_out: 0,
      maintenance: 0,
      lost: 0,
      retired: 0,
    };

    for (const tool of tools) {
      counts[tool.status] += 1;
    }

    return [
      { status: "Available", key: "available", count: counts.available },
      { status: "Checked out", key: "checked_out", count: counts.checked_out },
      { status: "Maintenance", key: "maintenance", count: counts.maintenance },
      { status: "Lost", key: "lost", count: counts.lost },
      { status: "Retired", key: "retired", count: counts.retired },
    ].filter((item) => item.count > 0);
  },
});

export const getActivityTrend = query({
  args: {
    sessionToken: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const days = args.days ?? 14;
    const dayMs = 24 * 60 * 60 * 1000;
    const today = startOfDay(Date.now());
    const since = today - (days - 1) * dayMs;

    const transactions = await ctx.db
      .query("toolTransactions")
      .withIndex("by_occurred_at", (q) => q.gte("occurredAt", since))
      .collect();

    const buckets = new Map<number, { checkouts: number; returns: number }>();
    for (let i = 0; i < days; i++) {
      const day = today - (days - 1 - i) * dayMs;
      buckets.set(day, { checkouts: 0, returns: 0 });
    }

    for (const tx of transactions) {
      const day = startOfDay(tx.occurredAt);
      const bucket = buckets.get(day);
      if (!bucket) continue;
      if (tx.type === "checkout") bucket.checkouts += 1;
      else bucket.returns += 1;
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([date, counts]) => ({
        date,
        label: formatDayLabel(date),
        checkouts: counts.checkouts,
        returns: counts.returns,
        total: counts.checkouts + counts.returns,
      }));
  },
});

export const getWhoHasWhat = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const checkouts = await ctx.db.query("activeCheckouts").collect();

    const byTechnician = new Map<
      string,
      {
        technicianId: string;
        technicianName: string;
        employeeCode: string;
        tools: { name: string; assetTag: string; checkedOutAt: number }[];
      }
    >();

    for (const checkout of checkouts) {
      const technician = await ctx.db.get(checkout.technicianId);
      const tool = await ctx.db.get(checkout.toolId);
      if (!technician || !tool) continue;

      const key = checkout.technicianId;
      if (!byTechnician.has(key)) {
        byTechnician.set(key, {
          technicianId: key,
          technicianName: technician.name,
          employeeCode: technician.employeeCode,
          tools: [],
        });
      }
      byTechnician.get(key)!.tools.push({
        name: tool.name,
        assetTag: tool.assetTag,
        checkedOutAt: checkout.checkedOutAt,
      });
    }

    return Array.from(byTechnician.values()).sort((a, b) =>
      a.technicianName.localeCompare(b.technicianName)
    );
  },
});
