import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const listSince = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_time", (q) => q.gt("createdAt", args.since))
      .collect();
  },
});
