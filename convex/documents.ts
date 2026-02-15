import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("documents").order("desc").collect();
  },
});

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"), v.literal("research"),
      v.literal("protocol"), v.literal("report"), v.literal("review")
    ),
    taskId: v.optional(v.id("tasks")),
    createdBy: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const agent = await ctx.db.get(args.createdBy);
    const id = await ctx.db.insert("documents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activities", {
      type: "document_created",
      agentId: args.createdBy,
      taskId: args.taskId,
      message: `${agent?.name} created document: ${args.title}`,
      createdAt: now,
    });
    return id;
  },
});
