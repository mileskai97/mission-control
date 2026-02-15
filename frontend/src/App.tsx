import { useState, useEffect } from "react";
import { ActivityFeed } from "./components/ActivityFeed";
import { TaskBoard } from "./components/TaskBoard";
import { AgentCards } from "./components/AgentCards";
import { DocumentPanel } from "./components/DocumentPanel";
import { TaskDetail } from "./components/TaskDetail";
import { Dashboard } from "./components/Dashboard";

type View = "dashboard" | "board" | "activity" | "agents" | "docs";

const navItems: { key: View; icon: string; label: string }[] = [
  { key: "dashboard", icon: "⌂", label: "Dashboard" },
  { key: "board", icon: "▦", label: "Board" },
  { key: "activity", icon: "⚡", label: "Activity" },
  { key: "agents", icon: "◉", label: "Agents" },
  { key: "docs", icon: "📄", label: "Docs" },
];

function CurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="mono text-sm" style={{ color: "var(--text-muted)" }}>
      {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-deep)" }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 64,
          background: "var(--bg-primary)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 16,
          gap: 4,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 20 }}>🎯</div>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => { setActiveView(item.key); setSelectedTaskId(null); }}
            title={item.label}
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              background: activeView === item.key ? "var(--accent-glow)" : "transparent",
              border: "none",
              borderLeft: activeView === item.key ? "3px solid var(--accent)" : "3px solid transparent",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
              transition: "all 0.2s",
              color: activeView === item.key ? "var(--accent-light)" : "var(--text-muted)",
            }}
          >
            {item.icon}
          </button>
        ))}
      </nav>

      {/* Main */}
      <div style={{ marginLeft: 64, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            height: 56,
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h1 style={{ fontSize: 18, margin: 0, color: "var(--text-primary)", letterSpacing: "0.08em" }}>
              MISSION CONTROL
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                color: "var(--success)",
                background: "rgba(34,197,94,0.1)",
                padding: "3px 10px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              <span
                className="live-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--success)",
                  display: "inline-block",
                }}
              />
              Live
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <CurrentTime />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              GlowStudio
            </span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {selectedTaskId ? (
            <div>
              <button
                onClick={() => setSelectedTaskId(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 16,
                  fontFamily: "var(--font-body)",
                }}
              >
                ← Back
              </button>
              <TaskDetail taskId={selectedTaskId} />
            </div>
          ) : (
            <>
              {activeView === "dashboard" && <Dashboard onSelectTask={setSelectedTaskId} />}
              {activeView === "board" && <TaskBoard onSelectTask={setSelectedTaskId} />}
              {activeView === "activity" && <ActivityFeed />}
              {activeView === "agents" && <AgentCards />}
              {activeView === "docs" && <DocumentPanel />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
