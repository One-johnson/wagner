import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword, verifyPassword } from "./lib/password";
import {
  createSession,
  deleteSessionByToken,
  generateSessionToken,
} from "./lib/session";
import { getAuthUser, requireAdmin } from "./lib/rbac";

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    rememberMe: v.optional(v.boolean()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user || !user.isActive) {
      throw new Error("Invalid email or password");
    }

    if (!verifyPassword(args.password, user.passwordHash)) {
      throw new Error("Invalid email or password");
    }

    const sessionToken = generateSessionToken();
    await createSession(ctx, {
      userId: user._id,
      sessionToken,
      rememberMe: args.rememberMe ?? false,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    });

    return {
      sessionToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await deleteSessionByToken(ctx, args.sessionToken);
    return { ok: true };
  },
});

export const getCurrentUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await getAuthUser(ctx, args.sessionToken);
  },
});

export const updateProfile = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await requireAdmin(ctx, args.sessionToken);
    const name = args.name.trim();
    if (name.length < 2) {
      throw new Error("Enter your full name");
    }

    const email = args.email.trim().toLowerCase();
    if (!email.includes("@")) {
      throw new Error("Enter a valid admin email");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing && existing._id !== authUser._id) {
      throw new Error("Email already in use");
    }

    await ctx.db.patch(authUser._id, {
      name,
      email,
      updatedAt: Date.now(),
    });

    return {
      _id: authUser._id,
      email,
      name,
      role: authUser.role,
    };
  },
});

export const changePassword = mutation({
  args: {
    sessionToken: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await requireAdmin(ctx, args.sessionToken);
    const user = await ctx.db.get(authUser._id);
    if (!user) throw new Error("User not found");

    if (!verifyPassword(args.currentPassword, user.passwordHash)) {
      throw new Error("Current password is incorrect");
    }
    if (args.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(args.newPassword),
      updatedAt: Date.now(),
    });
  },
});
