import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/rbac";
import { generateUniqueEmployeeCode } from "./lib/employeeCode";

const toolRowValidator = v.object({
  name: v.string(),
  assetTag: v.string(),
  category: v.optional(v.string()),
  barcode: v.optional(v.string()),
  conditionNotes: v.optional(v.string()),
});

const technicianRowValidator = v.object({
  name: v.string(),
  employeeCode: v.optional(v.string()),
});

export const importTools = mutation({
  args: {
    sessionToken: v.string(),
    rows: v.array(toolRowValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    const categories = await ctx.db.query("toolCategories").collect();
    const categoryByName = new Map(
      categories.map((c) => [c.name.toLowerCase(), c._id])
    );

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < args.rows.length; i++) {
      const row = args.rows[i];
      const line = i + 2;
      const name = row.name.trim();
      const assetTag = row.assetTag.trim().toUpperCase();

      if (!name) {
        errors.push(`Row ${line}: name is required`);
        skipped++;
        continue;
      }
      if (!assetTag) {
        errors.push(`Row ${line}: asset tag is required`);
        skipped++;
        continue;
      }

      const existing = await ctx.db
        .query("tools")
        .withIndex("by_asset_tag", (q) => q.eq("assetTag", assetTag))
        .unique();
      if (existing) {
        errors.push(`Row ${line}: asset tag "${assetTag}" already exists`);
        skipped++;
        continue;
      }

      let categoryId = undefined;
      const categoryName = row.category?.trim();
      if (categoryName) {
        const key = categoryName.toLowerCase();
        let id = categoryByName.get(key);
        if (!id) {
          id = await ctx.db.insert("toolCategories", {
            name: categoryName,
            createdAt: Date.now(),
          });
          categoryByName.set(key, id);
        }
        categoryId = id;
      }

      const now = Date.now();
      await ctx.db.insert("tools", {
        name,
        assetTag,
        barcode: row.barcode?.trim() || undefined,
        categoryId,
        status: "available",
        conditionNotes: row.conditionNotes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, skipped, errors };
  },
});

export const importTechnicians = mutation({
  args: {
    sessionToken: v.string(),
    rows: v.array(technicianRowValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < args.rows.length; i++) {
      const row = args.rows[i];
      const line = i + 2;
      const name = row.name.trim();

      if (!name) {
        errors.push(`Row ${line}: name is required`);
        skipped++;
        continue;
      }

      let employeeCode = row.employeeCode?.trim() ?? "";
      if (!employeeCode) {
        try {
          employeeCode = await generateUniqueEmployeeCode(ctx);
        } catch {
          errors.push(`Row ${line}: could not generate employee ID`);
          skipped++;
          continue;
        }
      } else if (!/^\d{5}$/.test(employeeCode)) {
        errors.push(`Row ${line}: employee ID must be a 5-digit number`);
        skipped++;
        continue;
      }

      const existing = await ctx.db
        .query("technicians")
        .withIndex("by_employee_code", (q) => q.eq("employeeCode", employeeCode))
        .unique();
      if (existing) {
        errors.push(`Row ${line}: employee ID "${employeeCode}" already exists`);
        skipped++;
        continue;
      }

      const now = Date.now();
      await ctx.db.insert("technicians", {
        name,
        employeeCode,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      created++;
    }

    return { created, skipped, errors };
  },
});
