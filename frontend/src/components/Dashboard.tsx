import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeColors: Record<string, string> = {
  task_created: "var(--accent)",
  task_updated: "var(--accent)",
  task_assigned: "var(--accent)",
  message_sent: "var(--info)",
  document_created: "var(--purple)",
  agent_heartbeat: "var(--success)",
  agent_status_change: "var(--success)",
  standup_generated: "var(--accent-light)",
};

export function Dashboard({ onSelectTask: _onSelectTask }: { onSelectTask: (id: string) => void }) {
  void _onSelectTask;
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);
  const activities = useQuery(api.activities.list, { limit: 10 });

  if (!tasks || !agents || !activities) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading...</div>;
  }

  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const activeAgents = agents.filter((a) => a.status === "active").length;

  const stats = [
    { label: "Total Tasks", value: tasks.length, color: "var(--accent)" },
    { label: "In Progress", value: inProgress, color: "var(--warning)" },
    { label: "Agents Active", value: `${activeAgents}/${agents.length}`, color: "var(--success)" },
    { label: "Completed", value: completed, color: "var(--success)" },
  ];

  const statusCounts: Record<string, number> = {};
  tasks.forEach((t) => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });

  return (
    <div className="animate-fadeInUp">
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`glass card-hover animate-fadeInUp stagger-${i + 1}`}
            style={{ borderRadius: 12, padding: 20 }}
          >
            <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              {s.label}
            </div>
            <div className="stat" style={{ fontSize: 36, fontWeight: 500, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Agent Strip */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)", fontWeight: 400 }}>
          Agent Status
        </h2>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="glass-subtle"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, minWidth: "fit-content" }}
            >
              <span style={{ fontSize: 24 }}>{agent.avatar || "🤖"}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{agent.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    className={agent.status === "active" ? "animate-pulse-dot" : ""}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: agent.status === "active" ? "var(--success)" : agent.status === "blocked" ? "var(--danger)" : "var(--text-muted)",
                      display: "inline-block",
                    }}
                  />
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {/* Recent Activity */}
        <div>
          <h2 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)", fontWeight: 400 }}>
            Recent Activity
          </h2>
          <div className="glass" style={{ borderRadius: 12, overflow: "hidden" }}>
            {activities.map((activity, i) => (
              <div
                key={activity._id}
                className={`animate-fadeInLeft stagger-${Math.min(i + 1, 8)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderBottom: i < activities.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: typeColors[activity.type] || "var(--accent)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)" }}>{activity.message}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Distribution */}
        <div>
          <h2 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono)", fontWeight: 400 }}>
            Distribution
          </h2>
          <div className="glass" style={{ borderRadius: 12, padding: 16 }}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div
                key={status}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                  {status.replace("_", " ")}
                </span>
                <span className="mono" style={{ fontSize: 16, fontWeight: 500, color: "var(--accent-light)" }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
