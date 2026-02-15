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

const typeIcons: Record<string, string> = {
  task_created: "📝",
  task_updated: "🔄",
  task_assigned: "👤",
  message_sent: "💬",
  document_created: "📄",
  agent_heartbeat: "💓",
  agent_status_change: "🔔",
  standup_generated: "📊",
};

export function ActivityFeed() {
  const activities = useQuery(api.activities.list, { limit: 50 });

  if (!activities) {
    return <div className="text-[#a8a29e] text-center py-8">Loading activity...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#a8a29e] text-lg">No activity yet</p>
        <p className="text-[#a8a29e]/60 text-sm mt-2">Activity will appear here as agents work</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold text-[#e8e6e3] mb-4">Activity Feed</h2>
      <div className="space-y-1">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-[#242424] transition-colors"
          >
            <span className="text-lg mt-0.5">{typeIcons[activity.type] || "📌"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e8e6e3]">{activity.message}</p>
              <p className="text-xs text-[#a8a29e] mt-1">{timeAgo(activity.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
