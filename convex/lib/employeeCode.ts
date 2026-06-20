import type { GenericMutationCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

export async function generateUniqueEmployeeCode(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const code = String(Math.floor(10000 + Math.random() * 90000));
    const existing = await ctx.db
      .query("technicians")
      .withIndex("by_employee_code", (q) => q.eq("employeeCode", code))
      .unique();
    if (!existing) return code;
  }
  throw new Error("Could not generate employee code");
}
