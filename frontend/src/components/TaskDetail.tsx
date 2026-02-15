import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusColors: Record<string, string> = {
  inbox: "#a8a29e",
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  review: "#8b5cf6",
  done: "#22c55e",
  blocked: "#ef4444",
};

export function TaskDetail({ taskId }: { taskId: string }) {
  const task = useQuery(api.tasks.get, { id: taskId as Id<"tasks"> });
  const messages = useQuery(api.messages.listByTask, { taskId: taskId as Id<"tasks"> });
  const agents = useQuery(api.agents.list);
  const postComment = useMutation(api.messages.create);

  const [comment, setComment] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  if (!task || !messages || !agents) {
    return <div className="text-[#a8a29e] text-center py-8">Loading task...</div>;
  }

  const agentMap = new Map(agents.map((a) => [a._id, a]));

  const handlePostComment = async () => {
    if (!comment.trim() || !selectedAgent) return;
    await postComment({
      taskId: taskId as Id<"tasks">,
      fromAgentId: selectedAgent as Id<"agents">,
      content: comment,
    });
    setComment("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Task Header */}
      <div className="bg-[#242424] border border-[#3d3d3d] rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{
                  color: statusColors[task.status],
                  backgroundColor: `${statusColors[task.status]}20`,
                }}
              >
                {task.status.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-xs font-bold text-[#d97706]">{task.priority}</span>
            </div>
            <h2 className="text-xl font-bold text-[#e8e6e3]">{task.title}</h2>
          </div>
        </div>
        <p className="text-sm text-[#a8a29e] leading-relaxed">{task.description}</p>

        {task.assigneeIds.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#3d3d3d]">
            <span className="text-xs text-[#a8a29e]">Assigned to:</span>
            {task.assigneeIds.map((id) => {
              const agent = agentMap.get(id);
              return agent ? (
                <span key={id} className="text-xs bg-[#2d2d2d] px-2 py-1 rounded-full text-[#e8e6e3]">
                  {agent.avatar} {agent.name}
                </span>
              ) : null;
            })}
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 mt-3">
            {task.tags.map((tag) => (
              <span key={tag} className="text-xs text-[#a8a29e] bg-[#2d2d2d] px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comment Thread */}
      <div className="bg-[#242424] border border-[#3d3d3d] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-[#e8e6e3] mb-4">
          Comments ({messages.length})
        </h3>

        {messages.length === 0 ? (
          <p className="text-sm text-[#a8a29e] py-4">No comments yet</p>
        ) : (
          <div className="space-y-4 mb-6">
            {messages.map((msg) => {
              const author = agentMap.get(msg.fromAgentId);
              return (
                <div key={msg._id} className="flex gap-3">
                  <span className="text-lg">{author?.avatar || "👤"}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#e8e6e3]">
                        {author?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-[#a8a29e]">{timeAgo(msg.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#a8a29e] mt-1 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Post Comment */}
        <div className="border-t border-[#3d3d3d] pt-4">
          <div className="flex gap-2 mb-2">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#e8e6e3] outline-none"
            >
              <option value="">Post as...</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.avatar} {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment... (use @name to mention)"
              className="flex-1 bg-[#2d2d2d] border border-[#3d3d3d] rounded-lg px-3 py-2 text-sm text-[#e8e6e3] placeholder-[#a8a29e]/40 outline-none resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) handlePostComment();
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={!comment.trim() || !selectedAgent}
              className="px-4 py-2 bg-[#d97706] text-white text-sm font-medium rounded-lg hover:bg-[#b45309] disabled:opacity-30 disabled:cursor-not-allowed transition-colors self-end"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
