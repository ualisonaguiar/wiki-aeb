import type { InfraAplicacao, InfraVhostInfo } from "../services/infra.service";

export interface InfraProjectLike {
  name: string;
  fullPath?: string;
  webUrl?: string;
  web_url?: string;
}

export type InfraEnvironment = "producao" | "homologacao" | "desenvolvimento" | "outro";

export function normalizeInfraText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSlug(value: string | null | undefined) {
  if (!value) return "";
  return normalizeInfraText(value.split("/").filter(Boolean).pop());
}

function getProjectTerms(project: InfraProjectLike) {
  const webUrl = project.webUrl ?? project.web_url;

  return [
    normalizeInfraText(project.name),
    normalizeInfraText(project.fullPath),
    normalizeInfraText(webUrl),
    getSlug(project.fullPath),
    getSlug(webUrl),
  ].filter(Boolean);
}

function scoreAplicacao(project: InfraProjectLike, aplicacao: InfraAplicacao) {
  const terms = getProjectTerms(project);
  const appName = normalizeInfraText(aplicacao.nome);
  const appSigla = normalizeInfraText(aplicacao.sigla);
  const appUrl = normalizeInfraText(aplicacao.urlVersionamento);

  if (appUrl && terms.some((term) => appUrl.includes(term) || term.includes(appUrl))) {
    return 100;
  }

  if (terms.some((term) => term === appName || term === appSigla)) {
    return 90;
  }

  const appTokens = [...new Set(`${appName} ${appSigla}`.split(" ").filter((token) => token.length > 2))];
  const projectText = terms.join(" ");
  const matchedTokens = appTokens.filter((token) => projectText.includes(token));

  if (appTokens.length && matchedTokens.length === appTokens.length) {
    return 70;
  }

  if (matchedTokens.length >= 2) {
    return 50;
  }

  return 0;
}

export function findAplicacaoForProject(project: InfraProjectLike, aplicacoes: InfraAplicacao[]) {
  return aplicacoes
    .map((aplicacao) => ({
      aplicacao,
      score: scoreAplicacao(project, aplicacao),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.aplicacao ?? null;
}

export function findVhostsForAplicacao(aplicacao: InfraAplicacao | null, vhosts: InfraVhostInfo[]) {
  if (!aplicacao) return [];

  const appUrl = normalizeInfraText(aplicacao.urlVersionamento);
  const hostNames = new Set(aplicacao.hosts.map((host) => normalizeInfraText(host.vhost)));

  return vhosts.filter((vhost) => {
    const vhostUrl = normalizeInfraText(vhost.urlVersionamento);
    const vhostName = normalizeInfraText(vhost.vhost);

    return (
      (appUrl && vhostUrl && (appUrl === vhostUrl || appUrl.includes(vhostUrl) || vhostUrl.includes(appUrl))) ||
      hostNames.has(vhostName)
    );
  });
}

export function getEnvironmentFromLogicalNetwork(logicalNetwork: string | null | undefined): InfraEnvironment {
  const network = normalizeInfraText(logicalNetwork);

  if (network.includes("producao") || network.includes("prod")) {
    return "producao";
  }

  if (network.includes("homologacao") || network.includes("homolog") || network.includes("hml")) {
    return "homologacao";
  }

  if (network.includes("desenvolvimento") || network.includes("desenv") || network.includes("dev")) {
    return "desenvolvimento";
  }

  return "outro";
}
