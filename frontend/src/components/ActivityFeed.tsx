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

const dotColors: Record<string, string> = {
  task_created: "var(--accent)",
  task_updated: "var(--accent)",
  task_assigned: "var(--accent)",
  message_sent: "var(--info)",
  document_created: "var(--purple)",
  agent_heartbeat: "var(--success)",
  agent_status_change: "var(--success)",
  standup_generated: "var(--accent-light)",
};

export function ActivityFeed() {
  const activities = useQuery(api.activities.list, { limit: 50 });

  if (!activities) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading activity...</div>;
  }

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>No activity yet</p>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>Activity will appear here as agents work</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: 24, color: "var(--text-primary)", marginBottom: 24 }}>Activity Feed</h2>
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 8,
            bottom: 8,
            width: 2,
            background: "var(--border)",
            borderRadius: 1,
          }}
        />
        {activities.map((activity, i) => {
          const color = dotColors[activity.type] || "var(--accent)";
          return (
            <div
              key={activity._id}
              className={`animate-fadeInLeft stagger-${Math.min(i + 1, 8)}`}
              style={{
                position: "relative",
                paddingBottom: 20,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: -24,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid var(--bg-deep)",
                  zIndex: 1,
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                  {activity.message}
                </p>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {timeAgo(activity.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
