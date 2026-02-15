import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.optional(v.array(v.id("documents"))),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.fromAgentId);
    const task = await ctx.db.get(args.taskId);
    if (!agent || !task) throw new Error("Agent or task not found");

    const id = await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });

    await ctx.db.insert("activities", {
      type: "message_sent",
      agentId: args.fromAgentId,
      taskId: args.taskId,
      message: `${agent.name} commented on "${task.title}"`,
      createdAt: Date.now(),
    });

    // Parse @mentions
    const mentionRegex = /@(\w+)/g;
    let match;
    while ((match = mentionRegex.exec(args.content)) !== null) {
      const mentionedName = match[1];
      const allAgents = await ctx.db.query("agents").collect();
      if (mentionedName.toLowerCase() === "all") {
        for (const a of allAgents) {
          if (a._id !== args.fromAgentId) {
            await ctx.db.insert("notifications", {
              mentionedAgentId: a._id,
              fromAgentId: args.fromAgentId,
              taskId: args.taskId,
              content: `${agent.name} mentioned @all on "${task.title}": ${args.content.substring(0, 200)}`,
              delivered: false,
              createdAt: Date.now(),
            });
          }
        }
      } else {
        const mentioned = allAgents.find(
          (a) => a.name.toLowerCase() === mentionedName.toLowerCase()
        );
        if (mentioned && mentioned._id !== args.fromAgentId) {
          await ctx.db.insert("notifications", {
            mentionedAgentId: mentioned._id,
            fromAgentId: args.fromAgentId,
            taskId: args.taskId,
            content: `${agent.name} mentioned you on "${task.title}": ${args.content.substring(0, 200)}`,
            delivered: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    return id;
  },
});
