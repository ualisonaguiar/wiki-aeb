import { GitCommit } from "lucide-react";
import type { PipelineInfo } from "../../services/gitlab";
import { formatDateRelative } from "../../utils";
import PipelineStatusBadge from "./ProjectDetailPipelineStatusBadge";

interface Props {
  pipeline: PipelineInfo;
}

export default function ProjectDetailPipelineStatusBanner({ pipeline }: Props) {
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
      <span className="font-mono text-xs text-gray-400">
        {pipeline.sha.slice(0, 8)}
      </span>
    </div>
  );
}
