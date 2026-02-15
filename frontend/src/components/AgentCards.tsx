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

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  idle: { bg: "#a8a29e20", text: "#a8a29e", dot: "#a8a29e" },
  active: { bg: "#22c55e20", text: "#22c55e", dot: "#22c55e" },
  blocked: { bg: "#ef444420", text: "#ef4444", dot: "#ef4444" },
};

export function AgentCards() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list);

  if (!agents || !tasks) {
    return <div className="text-[#a8a29e] text-center py-8">Loading agents...</div>;
  }

  const taskMap = new Map(tasks.map((t) => [t._id, t]));

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#e8e6e3] mb-4">Agent Squad</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const colors = statusColors[agent.status] || statusColors.idle;
          const currentTask = agent.currentTaskId ? taskMap.get(agent.currentTaskId) : null;

          return (
            <div
              key={agent._id}
              className="bg-[#242424] border border-[#3d3d3d] rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{agent.avatar || "🤖"}</span>
                <div>
                  <h3 className="text-base font-semibold text-[#e8e6e3]">{agent.name}</h3>
                  <p className="text-xs text-[#a8a29e]">{agent.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {agent.status}
                  </span>
                  <span className="text-[10px] text-[#a8a29e] ml-auto uppercase">
                    {agent.level}
                  </span>
                </div>

                {currentTask && (
                  <div className="bg-[#2d2d2d] rounded-lg p-2">
                    <p className="text-xs text-[#a8a29e]">Current task</p>
                    <p className="text-sm text-[#e8e6e3] truncate">{currentTask.title}</p>
                  </div>
                )}

                <div className="text-xs text-[#a8a29e]">
                  Last heartbeat: {timeAgo(agent.lastHeartbeat)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#a8a29e]">No agents registered yet</p>
        </div>
      )}
    </div>
  );
}
