import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const typeConfig: Record<string, { icon: string; color: string }> = {
  deliverable: { icon: "📦", color: "#f59e0b" },
  research: { icon: "🔬", color: "#3b82f6" },
  protocol: { icon: "📋", color: "#a78bfa" },
  report: { icon: "📊", color: "#22c55e" },
  review: { icon: "🔍", color: "#ef4444" },
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentPanel() {
  const documents = useQuery(api.documents.list);
  const agents = useQuery(api.agents.list);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!documents || !agents) {
    return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>Loading documents...</div>;
  }

  const agentMap = new Map(agents.map((a) => [a._id, a]));

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, color: "var(--text-primary)", marginBottom: 20 }}>Documents</h2>

      {documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>No documents yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8 }}>
            Documents will appear here as agents create deliverables
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {documents.map((doc, i) => {
            const author = agentMap.get(doc.createdBy);
            const cfg = typeConfig[doc.type] || { icon: "📄", color: "var(--accent)" };
            const isHovered = hoveredId === doc._id;

            return (
              <div
                key={doc._id}
                className={`glass card-hover animate-fadeInUp stagger-${Math.min(i + 1, 8)}`}
                style={{ borderRadius: 10, padding: 16, cursor: "default" }}
                onMouseEnter={() => setHoveredId(doc._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Type icon with colored circle */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: `${cfg.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{doc.title}</h3>
                      <span className="mono" style={{ fontSize: 10, color: cfg.color, background: `${cfg.color}18`, padding: "1px 6px", borderRadius: 4 }}>
                        {doc.type}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      {author && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {author.avatar} {author.name}
                        </span>
                      )}
                      <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                        {formatDate(doc.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Preview on hover */}
                {isHovered && (
                  <div
                    className="animate-fadeInUp"
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "var(--bg-tertiary)",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {doc.content.split("\n").slice(0, 3).join("\n").substring(0, 300)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
