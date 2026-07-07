import { Calendar, Clock, GitBranch, GitMerge } from "lucide-react";
import { Project } from "../../types";
import { formatDate, formatDateRelative } from "../../utils";
import { projetoService } from "../../services/projeto.service";
import { useEffect, useState } from "react";

interface Props {
  project: Project;
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {


  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function ProjectDetailMetaCards({ project }: Props) {

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetaCard
        icon={<Calendar size={15} className="text-blue-500" />}
        label="Criado em"
        value={formatDate(project.createdAt)}
      />
      <MetaCard
        icon={<Clock size={15} className="text-green-500" />}
        label="Última atividade"
        value={formatDateRelative(project.lastActivityAt)}
      />
      <MetaCard
        icon={<GitBranch size={15} className="text-purple-500" />}
        label="Branches"
        value={project.branches?.length ?? "—"}
      />
      <MetaCard
        icon={<GitMerge size={15} className="text-orange-500" />}
        label="Merge Requests"
        value={project.mergeRequests?.length ?? "—"}
      />
    </div>
  );
}
