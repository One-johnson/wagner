import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRoleValidator = v.literal("admin");

export const toolStatusValidator = v.union(
  v.literal("available"),
  v.literal("checked_out"),
  v.literal("maintenance"),
  v.literal("lost"),
  v.literal("retired")
);

export const transactionTypeValidator = v.union(
  v.literal("checkout"),
  v.literal("return")
);

export const conditionValidator = v.optional(
  v.union(
    v.literal("good"),
    v.literal("fair"),
    v.literal("poor"),
    v.literal("damaged")
  )
);

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: userRoleValidator,
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    lastUsedAt: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_user", ["userId"]),

  technicians: defineTable({
    name: v.string(),
    employeeCode: v.string(),
    photoId: v.optional(v.id("_storage")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_employee_code", ["employeeCode"]),

  toolCategories: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  tools: defineTable({
    name: v.string(),
    assetTag: v.string(),
    barcode: v.optional(v.string()),
    photoId: v.optional(v.id("_storage")),
    categoryId: v.optional(v.id("toolCategories")),
    status: toolStatusValidator,
    conditionNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_asset_tag", ["assetTag"])
    .index("by_barcode", ["barcode"])
    .index("by_status", ["status"])
    .index("by_category", ["categoryId"]),

  toolTransactions: defineTable({
    toolId: v.id("tools"),
    technicianId: v.id("technicians"),
    type: transactionTypeValidator,
    performedByUserId: v.id("users"),
    notes: v.optional(v.string()),
    conditionAtEvent: conditionValidator,
    occurredAt: v.number(),
  })
    .index("by_tool", ["toolId"])
    .index("by_technician", ["technicianId"])
    .index("by_occurred_at", ["occurredAt"]),

  activeCheckouts: defineTable({
    toolId: v.id("tools"),
    technicianId: v.id("technicians"),
    checkoutTransactionId: v.id("toolTransactions"),
    dueAt: v.optional(v.number()),
    checkedOutAt: v.number(),
  })
    .index("by_tool", ["toolId"])
    .index("by_technician", ["technicianId"]),

  notifications: defineTable({
    type: v.union(v.literal("overdue_checkout"), v.literal("due_soon")),
    title: v.string(),
    message: v.string(),
    href: v.optional(v.string()),
    relatedCheckoutId: v.optional(v.id("activeCheckouts")),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    dismissedAt: v.optional(v.number()),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_related_checkout", ["relatedCheckoutId"]),
});
