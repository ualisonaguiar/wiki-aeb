import { GitCommit } from "lucide-react";
import type { PipelineInfo } from "../../services/gitlab.old";
import { formatDateRelative } from "../../utils";
import PipelineStatusBadge from "./ProjectDetailPipelineStatusBadge";
import { useEffect, useState } from "react";
import { projetoService } from "../../services/projeto.service";

export default function ProjectDetailPipelineStatusBanner({ project }) {
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState<PipelineInfo | null>(null);

  useEffect(() => {
    setLoading(true);

    projetoService.getPipelineInfo(project.fullPath)
      .then((response) => {
        setPipeline(response?.pipelines?.nodes?.[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, [project.fullPath]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
        <p className="text-xs text-gray-500">Carregando pipeline...</p>
      </div>
    );
  }

  if (!pipeline) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
        <p className="text-xs text-gray-500">Nenhum pipeline encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
      <GitCommit size={15} className="flex-shrink-0 text-gray-400" />

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">
          Último pipeline · branch{" "}
          <span className="font-mono font-medium text-gray-800">
            {pipeline.ref}
          </span>
          {" · "}
          {formatDateRelative(pipeline.createdAt)}
        </p>
      </div>

      <PipelineStatusBadge status={pipeline.status} />
    </div>
  );
}