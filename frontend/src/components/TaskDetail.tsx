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
  inbox: "#a89f8c",
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  review: "#a78bfa",
  done: "#22c55e",
  blocked: "#ef4444",
};

const priorityColors: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#3b82f6",
  P3: "#a89f8c",
};

export function TaskDetail({ taskId }: { taskId: string }) {
  const task = useQuery(api.tasks.get, { id: taskId as Id<"tasks"> });
  const messages = useQuery(api.messages.listByTask, { taskId: taskId as Id<"tasks"> });
  const agents = useQuery(api.agents.list);
  const postComment = useMutation(api.messages.create);

  const [comment, setComment] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  if (!task || !messages || !agents) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading task...</div>;
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

  const sColor = statusColors[task.status] || "var(--accent)";
  const pColor = priorityColors[task.priority] || "var(--text-muted)";

  return (
    <div className="animate-fadeInUp" style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Task Header — sticky */}
      <div
        className="glass"
        style={{
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          position: "sticky",
          top: 72,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span
            className="mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: sColor,
              background: `${sColor}18`,
              padding: "3px 10px",
              borderRadius: 4,
              textTransform: "uppercase",
            }}
          >
            {task.status.replace("_", " ")}
          </span>
          <span
            className="mono"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: pColor,
              background: `${pColor}18`,
              padding: "3px 10px",
              borderRadius: 4,
            }}
          >
            {task.priority}
          </span>
        </div>
        <h2 style={{ fontSize: 22, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>{task.title}</h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginTop: 12 }}>
          {task.description}
        </p>

        {task.assigneeIds.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Assigned to</span>
            {task.assigneeIds.map((id) => {
              const agent = agentMap.get(id);
              return agent ? (
                <span
                  key={id}
                  className="glass-subtle"
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, color: "var(--text-primary)" }}
                >
                  {agent.avatar} {agent.name}
                </span>
              ) : null;
            })}
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {task.tags.map((tag) => (
              <span key={tag} style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "2px 8px", borderRadius: 4 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="glass" style={{ borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px", fontFamily: "var(--font-mono)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Comments ({messages.length})
        </h3>

        {messages.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--text-muted)", padding: "16px 0" }}>No comments yet</p>
        ) : (
          <div style={{ position: "relative", paddingLeft: 32, marginBottom: 24 }}>
            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 20,
                bottom: 20,
                width: 2,
                background: "var(--border)",
              }}
            />
            {messages.map((msg, i) => {
              const author = agentMap.get(msg.fromAgentId);
              return (
                <div
                  key={msg._id}
                  className={`animate-fadeInLeft stagger-${Math.min(i + 1, 8)}`}
                  style={{ position: "relative", paddingBottom: 20 }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: -26,
                      top: 2,
                      fontSize: 20,
                      zIndex: 1,
                    }}
                  >
                    {author?.avatar || "👤"}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {author?.name || "Unknown"}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comment input */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              color: "var(--text-primary)",
              outline: "none",
              marginBottom: 8,
              fontFamily: "var(--font-body)",
            }}
          >
            <option value="">Post as...</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>
                {a.avatar} {a.name}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              style={{
                flex: 1,
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--text-primary)",
                outline: "none",
                resize: "none",
                fontFamily: "var(--font-body)",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) handlePostComment();
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={!comment.trim() || !selectedAgent}
              style={{
                padding: "0 20px",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: comment.trim() && selectedAgent ? "pointer" : "not-allowed",
                opacity: comment.trim() && selectedAgent ? 1 : 0.3,
                transition: "all 0.2s",
                alignSelf: "flex-end",
                fontFamily: "var(--font-body)",
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
