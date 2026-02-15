import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status as any))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    createdBy: v.optional(v.id("agents")),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      priority: args.priority,
      status: args.assigneeIds?.length ? "assigned" : "inbox",
      assigneeIds: args.assigneeIds ?? [],
      createdBy: args.createdBy,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activities", {
      type: "task_created",
      agentId: args.createdBy,
      taskId: id,
      message: `Task created: ${args.title}`,
      createdAt: now,
    });
    if (args.assigneeIds) {
      for (const agentId of args.assigneeIds) {
        await ctx.db.insert("notifications", {
          mentionedAgentId: agentId,
          fromAgentId: args.createdBy,
          taskId: id,
          content: `You've been assigned: ${args.title}`,
          delivered: false,
          createdAt: now,
        });
      }
    }
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    status: v.optional(v.union(
      v.literal("inbox"), v.literal("assigned"), v.literal("in_progress"),
      v.literal("review"), v.literal("done"), v.literal("blocked")
    )),
    assigneeIds: v.optional(v.array(v.id("agents"))),
    blockedReason: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");
    const patch: any = { ...updates, updatedAt: Date.now() };
    await ctx.db.patch(id, patch);
    if (args.status && args.status !== task.status) {
      await ctx.db.insert("activities", {
        type: "task_updated",
        taskId: id,
        message: `Task "${task.title}" moved to ${args.status}`,
        createdAt: Date.now(),
      });
    }
  },
});
