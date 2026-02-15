import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const columns = [
  { key: "inbox", label: "Inbox", color: "#a8a29e" },
  { key: "assigned", label: "Assigned", color: "#3b82f6" },
  { key: "in_progress", label: "In Progress", color: "#f59e0b" },
  { key: "review", label: "Review", color: "#8b5cf6" },
  { key: "done", label: "Done", color: "#22c55e" },
] as const;

const priorityColors: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#3b82f6",
  P3: "#a8a29e",
};

export function TaskBoard({ onSelectTask }: { onSelectTask: (id: string) => void }) {
  const tasks = useQuery(api.tasks.list);
  const agents = useQuery(api.agents.list);

  if (!tasks || !agents) {
    return <div className="text-[#a8a29e] text-center py-8">Loading tasks...</div>;
  }

  const agentMap = new Map(agents.map((a) => [a._id, a]));

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#e8e6e3] mb-4">Task Board</h2>
      <div className="grid grid-cols-5 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="min-h-[300px]">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-sm font-medium text-[#a8a29e] uppercase tracking-wide">
                  {col.label}
                </h3>
                <span className="text-xs text-[#a8a29e]/60 ml-auto">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <button
                    key={task._id}
                    onClick={() => onSelectTask(task._id)}
                    className="w-full text-left bg-[#242424] border border-[#3d3d3d] rounded-lg p-3 hover:border-[#d97706]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: priorityColors[task.priority],
                          backgroundColor: `${priorityColors[task.priority]}20`,
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-[#e8e6e3] font-medium leading-tight">
                      {task.title}
                    </p>
                    {task.assigneeIds.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {task.assigneeIds.map((id) => {
                          const agent = agentMap.get(id);
                          return agent ? (
                            <span key={id} className="text-xs" title={agent.name}>
                              {agent.avatar || "👤"}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-[#a8a29e] bg-[#2d2d2d] px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
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
