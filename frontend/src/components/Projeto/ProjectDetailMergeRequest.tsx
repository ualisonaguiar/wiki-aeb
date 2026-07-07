import { GitMerge } from "lucide-react";
import { formatDateRelative } from "../../utils";
import ProjectDetailMRStateBadge from "./ProjectDetailMRStateBadge";

export default function ProjectDetailMergeRequest({ project }) {

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <GitMerge size={15} /> Merge Requests
      </h2>
      <div className="divide-y divide-gray-100">
        {project?.mergeRequests.map((mr) => (
          <div key={mr.iid} className="py-3">
            <div className="flex items-start gap-3">
              <ProjectDetailMRStateBadge state={mr.state} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {mr.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  #{mr.iid} · {mr.author?.name ?? "Desconhecido"} ·{" "}
                  {formatDateRelative(mr.createdAt)}
                </p>
                <p className="mt-1 font-mono text-xs text-gray-400">
                  {mr.sourceBranch} → {mr.targetBranch}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}