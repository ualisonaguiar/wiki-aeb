import { ExternalLink, GitBranch } from "lucide-react";

export default function ProjectDetailHeader({ project }) {


  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{project.description}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
          <GitBranch size={11} /> {project.repository?.rootRef}
        </span>
      </div>
      <a
        href={project.webUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
      >
        <ExternalLink size={14} />
        Abrir no GitLab
      </a>
    </div>
  );
}
