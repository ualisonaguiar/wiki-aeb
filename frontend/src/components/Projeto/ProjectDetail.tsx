import { useEffect, useState } from "react";
import { projetoService } from "../../services/projeto.service";
import type { Project } from "../../types";
import ProjectDetailHeader from "./ProjectDetailHeader";
import ProjectDetailMetaCards from "./ProjectDetailMetaCards";
import ProjectDetailPipelineStatusBanner from "./ProjectDetailPipelineStatusBanner";
import ProjectDetailTabs, { Tab } from "./ProjectDetailTabs";
import ProjectDetailOverview from "./ProjectDetailOverview";
import ProjectDetailBranch from "./ProjectDetailBranch";
import ProjectDetailReadme from "./ProjectDetailReadme";
import ProjectDetailMergeRequest from "./ProjectDetailMergeRequest";
import ProjectDetailInfra from "./ProjectDetailInfra";
import { useProjectRegisteredInfra } from "../../hooks/useProjectRegisteredInfra";

interface Props {
  project: Project;
}

export default function ProjectDetail({ project }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const registeredInfra = useProjectRegisteredInfra(project);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      projetoService.getBranchInfo(project.fullPath),
      projetoService.getInfoMergeRequest(project.fullPath)
    ])
      .then(([branchesRes, mrRes]) => {
        project.branches = branchesRes.repository.branchNames || [];
        project.mergeRequests = mrRes.mergeRequests.nodes || [];
      })
      .finally(() => setLoading(false));

  }, [project.fullPath]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
        <p className="text-xs text-gray-500">
          Carregando informações do projeto...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProjectDetailHeader project={project} />

      {/* Meta cards */}
      <ProjectDetailMetaCards project={project} />

      {/* Pipeline status banner */}
      <ProjectDetailPipelineStatusBanner project={project} />

      {/* Tabs */}
      <ProjectDetailTabs activeTab={activeTab} onChange={setActiveTab} project={project} />

      {/* Tab: Visão Geral */}
      {activeTab === "overview" && (
        <ProjectDetailOverview
          languages={project.languages}
          infraEnvironmentCounts={registeredInfra.environmentCounts}
          infraVhosts={registeredInfra.vhosts}
          infraLoading={registeredInfra.loading}
          infraError={registeredInfra.error}
        />
      )}

      {/* Tab: Visão Geral */}
      {activeTab === "branches" && (
        <ProjectDetailBranch project={project} />
      )}

      {/* Tab: README */}
      {activeTab === "readme" && (
        <ProjectDetailReadme project={project} />
      )}

      {/* Tab: Merge Requests */}
      {activeTab === "mergerequests" && (
        <ProjectDetailMergeRequest project={project} />
      )}

      {/* Tab: Infraestrutura */}
      {activeTab === "infra" && (
        <ProjectDetailInfra
          aplicacao={registeredInfra.aplicacao}
          vhosts={registeredInfra.vhosts}
          loading={registeredInfra.loading}
          error={registeredInfra.error}
        />
      )}
    </div>
  );
}
