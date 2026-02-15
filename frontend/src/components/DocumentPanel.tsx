import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const typeIcons: Record<string, string> = {
  deliverable: "📦",
  research: "🔬",
  protocol: "📋",
  report: "📊",
  review: "🔍",
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

  if (!documents || !agents) {
    return <div className="text-[#a8a29e] text-center py-8">Loading documents...</div>;
  }

  const agentMap = new Map(agents.map((a) => [a._id, a]));

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold text-[#e8e6e3] mb-4">Documents</h2>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#a8a29e] text-lg">No documents yet</p>
          <p className="text-[#a8a29e]/60 text-sm mt-2">
            Documents will appear here as agents create deliverables
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const author = agentMap.get(doc.createdBy);
            return (
              <div
                key={doc._id}
                className="bg-[#242424] border border-[#3d3d3d] rounded-lg p-4 hover:border-[#d97706]/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{typeIcons[doc.type] || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#e8e6e3]">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#a8a29e] bg-[#2d2d2d] px-2 py-0.5 rounded">
                        {doc.type}
                      </span>
                      {author && (
                        <span className="text-xs text-[#a8a29e]">
                          by {author.avatar} {author.name}
                        </span>
                      )}
                      <span className="text-xs text-[#a8a29e]/60 ml-auto">
                        {formatDate(doc.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#a8a29e] mt-2 line-clamp-2">
                      {doc.content.substring(0, 200)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
