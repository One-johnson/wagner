import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";
import { conditionValidator } from "./schema";

export const listActive = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const checkouts = await ctx.db.query("activeCheckouts").collect();

    const rows = await Promise.all(
      checkouts.map(async (checkout) => {
        const tool = await ctx.db.get(checkout.toolId);
        const technician = await ctx.db.get(checkout.technicianId);
        if (!tool || !technician) return null;

        const now = Date.now();
        const isOverdue = checkout.dueAt ? checkout.dueAt < now : false;

        return {
          _id: checkout._id,
          toolId: tool._id,
          toolName: tool.name,
          assetTag: tool.assetTag,
          technicianId: technician._id,
          technicianName: technician.name,
          employeeCode: technician.employeeCode,
          checkedOutAt: checkout.checkedOutAt,
          dueAt: checkout.dueAt ?? null,
          isOverdue,
        };
      })
    );

    return rows
      .filter(Boolean)
      .sort((a, b) => b!.checkedOutAt - a!.checkedOutAt);
  },
});

export const checkout = mutation({
  args: {
    sessionToken: v.string(),
    toolId: v.id("tools"),
    technicianId: v.id("technicians"),
    dueAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    conditionAtEvent: conditionValidator,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const technician = await ctx.db.get(args.technicianId);
    if (!technician || !technician.isActive) {
      throw new Error("Technician not found or inactive");
    }

    const tool = await ctx.db.get(args.toolId);
    if (!tool) throw new Error("Tool not found");
    if (tool.status !== "available") {
      throw new Error(`Tool is not available (status: ${tool.status})`);
    }

    const existingCheckout = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_tool", (q) => q.eq("toolId", args.toolId))
      .unique();
    if (existingCheckout) {
      throw new Error("Tool is already checked out");
    }

    const now = Date.now();
    const transactionId = await ctx.db.insert("toolTransactions", {
      toolId: args.toolId,
      technicianId: args.technicianId,
      type: "checkout",
      performedByUserId: admin._id,
      notes: args.notes?.trim() || undefined,
      conditionAtEvent: args.conditionAtEvent,
      occurredAt: now,
    });

    await ctx.db.insert("activeCheckouts", {
      toolId: args.toolId,
      technicianId: args.technicianId,
      checkoutTransactionId: transactionId,
      dueAt: args.dueAt,
      checkedOutAt: now,
    });

    await ctx.db.patch(args.toolId, {
      status: "checked_out",
      updatedAt: now,
    });

    return { transactionId };
  },
});

export const returnTool = mutation({
  args: {
    sessionToken: v.string(),
    checkoutId: v.id("activeCheckouts"),
    notes: v.optional(v.string()),
    conditionAtEvent: conditionValidator,
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx, args.sessionToken);

    const checkout = await ctx.db.get(args.checkoutId);
    if (!checkout) throw new Error("Active checkout not found");

    const tool = await ctx.db.get(checkout.toolId);
    if (!tool) throw new Error("Tool not found");

    const now = Date.now();
    await ctx.db.insert("toolTransactions", {
      toolId: checkout.toolId,
      technicianId: checkout.technicianId,
      type: "return",
      performedByUserId: admin._id,
      notes: args.notes?.trim() || undefined,
      conditionAtEvent: args.conditionAtEvent,
      occurredAt: now,
    });

    await ctx.db.delete(checkout._id);
    await ctx.db.patch(checkout.toolId, {
      status: "available",
      updatedAt: now,
    });

    return { ok: true };
  },
});
