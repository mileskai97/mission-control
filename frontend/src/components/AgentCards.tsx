import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function timeAgo(ts: number | undefined): string {
  if (!ts) return "never";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusBorderColors: Record<string, string> = {
  active: "var(--success)",
  idle: "var(--accent)",
  blocked: "var(--danger)",
};

export function AgentCards() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list);

  if (!agents || !tasks) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading agents...</div>;
  }

  const taskMap = new Map(tasks.map((t) => [t._id, t]));

  return (
    <div>
      <h2 style={{ fontSize: 24, color: "var(--text-primary)", marginBottom: 20 }}>Agent Squad</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {agents.map((agent, i) => {
          const borderColor = statusBorderColors[agent.status] || statusBorderColors.idle;
          const currentTask = agent.currentTaskId ? taskMap.get(agent.currentTaskId) : null;

          return (
            <div
              key={agent._id}
              className={`glass card-hover animate-fadeInUp stagger-${Math.min(i + 1, 8)}`}
              style={{
                borderRadius: 12,
                padding: 24,
                borderTop: `3px solid ${borderColor}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 48 }}>{agent.avatar || "🤖"}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{agent.name}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>{agent.role}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className={agent.status === "active" ? "animate-pulse-dot" : ""}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: borderColor,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    {agent.status}
                  </span>
                  <span
                    className="mono"
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      fontWeight: 500,
                      color: "var(--accent-light)",
                      background: "var(--accent-glow)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {agent.level}
                  </span>
                </div>

                {currentTask && (
                  <div style={{ background: "var(--bg-tertiary)", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Current task</div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {currentTask.title}
                    </div>
                  </div>
                )}

                <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  ♥ {timeAgo(agent.lastHeartbeat)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {agents.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          No agents registered yet
        </div>
      )}
    </div>
  );
}
