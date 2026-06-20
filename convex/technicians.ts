import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";

export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const technicians = await ctx.db.query("technicians").collect();
    const rows = await Promise.all(
      technicians.map(async (tech) => ({
        _id: tech._id,
        name: tech.name,
        employeeCode: tech.employeeCode,
        photoId: tech.photoId ?? null,
        photoUrl: tech.photoId ? await ctx.storage.getUrl(tech.photoId) : null,
        isActive: tech.isActive,
        createdAt: tech.createdAt,
        updatedAt: tech.updatedAt,
      }))
    );
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const listActive = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const technicians = await ctx.db.query("technicians").collect();
    return technicians
      .filter((t) => t.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const suggestEmployeeCode = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    for (let attempt = 0; attempt < 30; attempt++) {
      const code = String(Math.floor(10000 + Math.random() * 90000));
      const existing = await ctx.db
        .query("technicians")
        .withIndex("by_employee_code", (q) => q.eq("employeeCode", code))
        .unique();
      if (!existing) return code;
    }

    throw new Error("Could not generate employee code");
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    employeeCode: v.string(),
    photoId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const employeeCode = args.employeeCode.trim();
    if (!/^\d{5}$/.test(employeeCode)) {
      throw new Error("Employee code must be a 5-digit number");
    }

    const existing = await ctx.db
      .query("technicians")
      .withIndex("by_employee_code", (q) => q.eq("employeeCode", employeeCode))
      .unique();
    if (existing) throw new Error("Employee code already exists");

    const now = Date.now();
    return await ctx.db.insert("technicians", {
      name: args.name.trim(),
      employeeCode,
      photoId: args.photoId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    technicianId: v.id("technicians"),
    name: v.optional(v.string()),
    employeeCode: v.optional(v.string()),
    photoId: v.optional(v.union(v.id("_storage"), v.null())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const technician = await ctx.db.get(args.technicianId);
    if (!technician) throw new Error("Technician not found");

    if (
      args.employeeCode &&
      args.employeeCode.trim().toUpperCase() !== technician.employeeCode
    ) {
      const existing = await ctx.db
        .query("technicians")
        .withIndex("by_employee_code", (q) =>
          q.eq("employeeCode", args.employeeCode!.trim().toUpperCase())
        )
        .unique();
      if (existing) throw new Error("Employee code already exists");
    }

    await ctx.db.patch(args.technicianId, {
      ...(args.name !== undefined ? { name: args.name.trim() } : {}),
      ...(args.photoId !== undefined
        ? { photoId: args.photoId ?? undefined }
        : {}),
      ...(args.employeeCode !== undefined
        ? { employeeCode: args.employeeCode.trim().toUpperCase() }
        : {}),
      ...(args.isActive !== undefined ? { isActive: args.isActive } : {}),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    technicianId: v.id("technicians"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const technician = await ctx.db.get(args.technicianId);
    if (!technician) throw new Error("Technician not found");

    const activeCheckout = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_technician", (q) => q.eq("technicianId", args.technicianId))
      .first();
    if (activeCheckout) {
      throw new Error("Cannot delete a technician with active checkouts.");
    }

    const transaction = await ctx.db
      .query("toolTransactions")
      .withIndex("by_technician", (q) => q.eq("technicianId", args.technicianId))
      .first();
    if (transaction) {
      throw new Error("Cannot delete a technician that has transaction history.");
    }

    await ctx.db.delete(args.technicianId);
  },
});

export const getWithCheckouts = query({
  args: { sessionToken: v.string(), technicianId: v.id("technicians") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const technician = await ctx.db.get(args.technicianId);
    if (!technician) return null;

    const checkouts = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_technician", (q) => q.eq("technicianId", args.technicianId))
      .collect();

    const tools = await Promise.all(
      checkouts.map(async (checkout) => {
        const tool = await ctx.db.get(checkout.toolId);
        return tool
          ? {
              checkoutId: checkout._id,
              toolId: tool._id,
              toolName: tool.name,
              assetTag: tool.assetTag,
              checkedOutAt: checkout.checkedOutAt,
              dueAt: checkout.dueAt ?? null,
            }
          : null;
      })
    );

    return {
      ...technician,
      activeTools: tools.filter(Boolean),
    };
  },
});
