import { useState } from "react";
import { ActivityFeed } from "./components/ActivityFeed";
import { TaskBoard } from "./components/TaskBoard";
import { AgentCards } from "./components/AgentCards";
import { DocumentPanel } from "./components/DocumentPanel";
import { TaskDetail } from "./components/TaskDetail";

type Tab = "board" | "activity" | "agents" | "docs";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("board");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "board", label: "Task Board", icon: "📋" },
    { key: "activity", label: "Activity", icon: "⚡" },
    { key: "agents", label: "Agents", icon: "🤖" },
    { key: "docs", label: "Documents", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <header className="border-b border-[#3d3d3d] bg-[#242424] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h1 className="text-xl font-bold text-[#e8e6e3] tracking-tight">
              Mission Control
            </h1>
            <span className="text-xs bg-[#d97706]/20 text-[#f59e0b] px-2 py-0.5 rounded-full font-medium">
              LIVE
            </span>
          </div>
          <div className="text-sm text-[#a8a29e]">
            GlowStudio Agent Squad
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-[#3d3d3d] bg-[#242424] px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedTaskId(null); }}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-[#d97706] text-[#f59e0b]"
                  : "border-transparent text-[#a8a29e] hover:text-[#e8e6e3]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {selectedTaskId ? (
          <div>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="mb-4 text-sm text-[#a8a29e] hover:text-[#e8e6e3] transition-colors"
            >
              ← Back to board
            </button>
            <TaskDetail taskId={selectedTaskId} />
          </div>
        ) : (
          <>
            {activeTab === "board" && <TaskBoard onSelectTask={setSelectedTaskId} />}
            {activeTab === "activity" && <ActivityFeed />}
            {activeTab === "agents" && <AgentCards />}
            {activeTab === "docs" && <DocumentPanel />}
          </>
        )}
      </main>
    </div>
  );
}
