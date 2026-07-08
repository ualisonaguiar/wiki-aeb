import { useEffect, useMemo, useState } from "react";
import {
  infraService,
  type InfraAplicacao,
  type InfraVhostInfo,
} from "../services/infra.service";
import {
  findAplicacaoForProject,
  findVhostsForAplicacao,
  getEnvironmentFromLogicalNetwork,
  type InfraEnvironment,
  type InfraProjectLike,
} from "../utils/infraProjectMatch";

export type InfraEnvironmentCounts = Record<InfraEnvironment, number>;

const emptyCounts: InfraEnvironmentCounts = {
  producao: 0,
  homologacao: 0,
  desenvolvimento: 0,
  outro: 0,
};

export function useProjectRegisteredInfra(project: InfraProjectLike) {
  const [aplicacoes, setAplicacoes] = useState<InfraAplicacao[]>([]);
  const [vhostInformacoes, setVhostInformacoes] = useState<InfraVhostInfo[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    Promise.all([
      infraService.getAplicacoes(),
      infraService.getVhostInformacoes(),
    ])
      .then(([aplicacoesData, vhostData]) => {
        if (!mounted) return;
        setAplicacoes(aplicacoesData);
        setVhostInformacoes(vhostData);
      })
      .catch((err: unknown) => {
        if (mounted) setError(String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [project.fullPath, project.name, project.webUrl, project.web_url]);

  const aplicacao = useMemo(
    () => findAplicacaoForProject(project, aplicacoes),
    [aplicacoes, project],
  );

  const vhosts = useMemo(
    () => findVhostsForAplicacao(aplicacao, vhostInformacoes),
    [aplicacao, vhostInformacoes],
  );

  const environmentCounts = useMemo(
    () =>
      vhosts.reduce<InfraEnvironmentCounts>((counts, vhost) => {
        const environment = getEnvironmentFromLogicalNetwork(
          vhost.logicalNetwork,
        );
        return {
          ...counts,
          [environment]: counts[environment] + 1,
        };
      }, emptyCounts),
    [vhosts],
  );

  return {
    aplicacao,
    vhosts,
    environmentCounts,
    loading,
    error,
  };
}
