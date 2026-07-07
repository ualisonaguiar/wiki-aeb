import { GitBranch } from "lucide-react";

export default function ProjectDetailBranch({ project }) {

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <GitBranch size={15} /> Branches
        {project?.branches?.length ? (
          <span className="text-gray-400">({project.branches.length})</span>
        ) : null}
      </h2>

      <div className="divide-y divide-gray-100">
        {project?.branches?.map((branch) => (
          <div key={branch} className="flex items-center gap-2 py-2.5">
            <GitBranch size={13} className="flex-shrink-0 text-gray-400" />
            <span className="font-mono text-sm text-gray-800">
              {branch}
            </span>
            {branch === project.repository.rootRef && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                default
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}