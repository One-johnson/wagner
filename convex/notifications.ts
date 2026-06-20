import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";
import { requireAdmin } from "./lib/rbac";

type MutationCtx = GenericMutationCtx<DataModel>;

async function hasActiveNotification(
  ctx: MutationCtx,
  checkoutId: Id<"activeCheckouts">,
  type: "overdue_checkout" | "due_soon"
) {
  const existing = await ctx.db
    .query("notifications")
    .withIndex("by_related_checkout", (q) => q.eq("relatedCheckoutId", checkoutId))
    .collect();

  return existing.some((n) => n.type === type && !n.dismissedAt);
}

export const list = query({
  args: {
    sessionToken: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const limit = args.limit ?? 30;

    const notifications = await ctx.db.query("notifications").collect();
    return notifications
      .filter((n) => !n.dismissedAt)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
      .map((n) => ({
        _id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        href: n.href ?? null,
        createdAt: n.createdAt,
        readAt: n.readAt ?? null,
      }));
  },
});

export const unreadCount = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const notifications = await ctx.db.query("notifications").collect();
    return notifications.filter((n) => !n.dismissedAt && !n.readAt).length;
  },
});

export const markRead = mutation({
  args: {
    sessionToken: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.dismissedAt) return;

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    });
  },
});

export const markAllRead = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const now = Date.now();
    const notifications = await ctx.db.query("notifications").collect();

    for (const notification of notifications) {
      if (!notification.dismissedAt && !notification.readAt) {
        await ctx.db.patch(notification._id, { readAt: now });
      }
    }
  },
});

export const dismiss = mutation({
  args: {
    sessionToken: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.dismissedAt) return;

    await ctx.db.patch(args.notificationId, {
      dismissedAt: Date.now(),
      readAt: notification.readAt ?? Date.now(),
    });
  },
});

export const dismissAll = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const now = Date.now();
    const notifications = await ctx.db.query("notifications").collect();

    for (const notification of notifications) {
      if (!notification.dismissedAt) {
        await ctx.db.patch(notification._id, {
          dismissedAt: now,
          readAt: notification.readAt ?? now,
        });
      }
    }
  },
});

export const scanCheckoutReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const dueSoonWindow = now + 24 * 60 * 60 * 1000;
    const checkouts = await ctx.db.query("activeCheckouts").collect();
    const notifications = await ctx.db.query("notifications").collect();

    for (const notification of notifications) {
      if (!notification.relatedCheckoutId || notification.dismissedAt) continue;
      const checkout = await ctx.db.get(notification.relatedCheckoutId);
      if (!checkout) {
        await ctx.db.patch(notification._id, {
          dismissedAt: now,
          readAt: notification.readAt ?? now,
        });
      }
    }

    for (const checkout of checkouts) {
      if (!checkout.dueAt) continue;

      const tool = await ctx.db.get(checkout.toolId);
      const technician = await ctx.db.get(checkout.technicianId);
      if (!tool || !technician) continue;

      const label = `${tool.assetTag} (${tool.name})`;
      const techLabel = `${technician.name} (${technician.employeeCode})`;

      if (checkout.dueAt < now) {
        const exists = await hasActiveNotification(ctx, checkout._id, "overdue_checkout");
        if (!exists) {
          await ctx.db.insert("notifications", {
            type: "overdue_checkout",
            title: "Overdue return",
            message: `${label} is overdue — checked out to ${techLabel}`,
            href: "/admin/checkouts",
            relatedCheckoutId: checkout._id,
            createdAt: now,
          });
        }
      } else if (checkout.dueAt <= dueSoonWindow) {
        const exists = await hasActiveNotification(ctx, checkout._id, "due_soon");
        if (!exists) {
          await ctx.db.insert("notifications", {
            type: "due_soon",
            title: "Return due soon",
            message: `${label} is due ${new Date(checkout.dueAt).toLocaleDateString()} — ${techLabel}`,
            href: "/admin/checkouts",
            relatedCheckoutId: checkout._id,
            createdAt: now,
          });
        }
      }
    }
  },
});
