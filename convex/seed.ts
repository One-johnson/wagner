import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword } from "./lib/password";

export const isSeeded = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return { seeded: Boolean(user) };
  },
});

export const bootstrap = mutation({
  args: {
    secret: v.optional(v.string()),
    adminEmail: v.string(),
    adminPassword: v.string(),
    adminName: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.SEED_SECRET;
    if (args.secret !== undefined) {
      if (!expectedSecret || args.secret !== expectedSecret) {
        throw new Error("Invalid seed secret");
      }
    } else {
      const existing = await ctx.db.query("users").first();
      if (existing) {
        throw new Error("System already initialized");
      }
    }

    const adminEmail = args.adminEmail.trim().toLowerCase();
    if (!adminEmail.includes("@")) {
      throw new Error("Enter a valid admin email");
    }
    const adminName = args.adminName.trim();
    if (adminName.length < 2) {
      throw new Error("Enter your full name");
    }
    if (args.adminPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    const now = Date.now();
    const adminId = await ctx.db.insert("users", {
      email: adminEmail,
      name: adminName,
      passwordHash: hashPassword(args.adminPassword),
      role: "admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { adminId, adminEmail };
  },
});
