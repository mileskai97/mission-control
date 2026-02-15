import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const columns = [
  { key: "inbox", label: "Inbox", color: "#a89f8c" },
  { key: "assigned", label: "Assigned", color: "#3b82f6" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "review", label: "Review", color: "#a78bfa" },
  { key: "done", label: "Done", color: "#22c55e" },
] as const;

const priorityColors: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#3b82f6",
  P3: "#a89f8c",
};

export function TaskBoard({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);

  if (!tasks || !agents) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading tasks...</div>;
  }

  const agentMap = new Map(agents.map((a) => [a._id, a]));

  return (
    <div>
      <h2 style={{ fontSize: 24, color: "var(--text-primary)", marginBottom: 20 }}>Task Board</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} style={{ minHeight: 300 }}>
              {/* Column header with left border */}
              <div
                style={{
                  borderLeft: `3px solid ${col.color}`,
                  paddingLeft: 10,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {col.label}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{colTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {colTasks.map((task, i) => (
                  <button
                    key={task._id}
                    onClick={() => onSelectTask(task._id)}
                    className={`glass card-hover animate-fadeInUp stagger-${Math.min(i + 1, 8)}`}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      borderRadius: 10,
                      padding: 14,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {/* Priority */}
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: priorityColors[task.priority],
                        background: `${priorityColors[task.priority]}18`,
                        padding: "2px 8px",
                        borderRadius: 4,
                        alignSelf: "flex-start",
                      }}
                    >
                      {task.priority}
                    </span>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                      {task.title}
                    </p>
                    {task.tags && task.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4 }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Assignee avatars overlapping */}
                    {task.assigneeIds.length > 0 && (
                      <div style={{ display: "flex", marginTop: 4 }}>
                        {task.assigneeIds.map((id, idx) => {
                          const agent = agentMap.get(id);
                          return agent ? (
                            <span
                              key={id}
                              title={agent.name}
                              style={{
                                fontSize: 18,
                                marginLeft: idx > 0 ? -6 : 0,
                                zIndex: task.assigneeIds.length - idx,
                                position: "relative",
                              }}
                            >
                              {agent.avatar || "👤"}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
