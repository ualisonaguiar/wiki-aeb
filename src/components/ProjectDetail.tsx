import type { ReactNode } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ExternalLink,
  Calendar,
  Clock,
  Code2,
  GitBranch,
  GitCommit,
  GitMerge,
  BookOpen,
  Loader2,
  AlertTriangle,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
} from "lucide-react";
import type { InfraVM } from "../hooks/useInfra";
import clsx from "clsx";
import type { Project } from "../types";
import { formatDate, formatDateRelative, getLangColor } from "../utils";
import LanguageBar from "./LanguageBar";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useProjectGraphQL } from "../hooks/useProjectGraphQL";
import { useInfra } from "../hooks/useInfra";

interface Props {
  project: Project;
}

type Tab = "overview" | "branches" | "readme" | "mergerequests" | "infra";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Visão Geral", icon: <Code2 size={14} /> },
  { id: "branches", label: "Branches", icon: <GitBranch size={14} /> },
  { id: "readme", label: "README", icon: <BookOpen size={14} /> },
  {
    id: "mergerequests",
    label: "Merge Requests",
    icon: <GitMerge size={14} />,
  },
  { id: "infra", label: "Infraestrutura", icon: <Server size={14} /> },
];

export default function ProjectDetail({ project }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const projectKey =
    project.web_url.split("/").pop() ??
    project.name.toLowerCase().replace(/\s+/g, "-");
  const {
    vms,
    allVms,
    loading: infraLoading,
    error: infraError,
    source: infraSource,
  } = useInfra(projectKey);
  const fullPath = project.web_url.replace(/^https?:\/\/[^/]+\//, "");
  const { data, loading, error } = useProjectGraphQL(fullPath);

  const langEntries = Object.entries(project.languages).sort(
    (a, b) => b[1] - a[1],
  );
  const radarData = langEntries
    .slice(0, 6)
    .map(([lang, pct]) => ({ lang, pct }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          )}
          {data?.defaultBranch && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
              <GitBranch size={11} /> {data.defaultBranch}
            </span>
          )}
        </div>
        <a
          href={project.web_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600"
        >
          <ExternalLink size={14} />
          Abrir no GitLab
        </a>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCard
          icon={<Calendar size={15} className="text-blue-500" />}
          label="Criado em"
          value={formatDate(project.created_at)}
        />
        <MetaCard
          icon={<Clock size={15} className="text-green-500" />}
          label="Última atividade"
          value={formatDateRelative(project.last_activity_at)}
        />
        <MetaCard
          icon={<GitBranch size={15} className="text-purple-500" />}
          label="Branches"
          value={loading ? "…" : String(data?.branches.length ?? "—")}
        />
        <MetaCard
          icon={<GitMerge size={15} className="text-orange-500" />}
          label="Merge Requests"
          value={loading ? "…" : String(data?.mergeRequests.length ?? "—")}
        />
      </div>

      {/* GraphQL status */}
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <Loader2 size={14} className="animate-spin" /> Carregando dados do
          GitLab…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          <AlertTriangle size={14} /> Alguns dados não puderam ser carregados:{" "}
          {error}
        </div>
      )}

      {/* Pipeline status banner */}
      {data?.pipelines[0] && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3">
          <GitCommit size={15} className="flex-shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">
              Último pipeline · branch{" "}
              <span className="font-mono font-medium text-gray-800">
                {data.pipelines[0].ref}
              </span>
              {" · "}
              {formatDateRelative(data.pipelines[0].createdAt)}
            </p>
          </div>
          <PipelineStatusBadge status={data.pipelines[0].status} />
          <span className="font-mono text-xs text-gray-400">
            {data.pipelines[0].sha.slice(0, 8)}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "branches" && data?.branches.length ? (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  {data.branches.length}
                </span>
              ) : null}
              {tab.id === "mergerequests" && data?.mergeRequests.length ? (
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  {data.mergeRequests.length}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Visão Geral */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Code2 size={15} /> Linguagens
            </h2>
            <LanguageBar languages={project.languages} />
          </div>

          {radarData.length > 2 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">
                Distribuição Visual
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="lang" tick={{ fontSize: 12 }} />
                    <Radar
                      name="Uso (%)"
                      dataKey="pct"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">
              Detalhamento
            </h2>
            <div className="space-y-3">
              {langEntries.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  Repositório sem código detectado.
                </p>
              )}
              {langEntries.map(([lang, pct]) => (
                <div key={lang} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: getLangColor(lang) }}
                  />
                  <span className="w-32 text-sm text-gray-700">{lang}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: getLangColor(lang),
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs text-gray-400">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Branches */}
      {activeTab === "branches" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <GitBranch size={15} /> Branches
            {data?.branches.length ? (
              <span className="text-gray-400">({data.branches.length})</span>
            ) : null}
          </h2>
          {loading && <LoadingRow />}
          {!loading && !data?.branches.length && (
            <p className="text-sm text-gray-400 italic">
              Nenhuma branch encontrada.
            </p>
          )}
          <div className="divide-y divide-gray-100">
            {data?.branches.map((branch) => (
              <div key={branch} className="flex items-center gap-2 py-2.5">
                <GitBranch size={13} className="flex-shrink-0 text-gray-400" />
                <span className="font-mono text-sm text-gray-800">
                  {branch}
                </span>
                {branch === data.defaultBranch && (
                  <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: README */}
      {activeTab === "readme" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <BookOpen size={15} /> README
          </h2>
          {loading && <LoadingRow />}
          {!loading && !data?.readme && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-medium text-amber-800">
                README não encontrado
              </p>
              <p className="mt-1 text-amber-700">
                O projeto não possui um{" "}
                <code className="rounded bg-amber-100 px-1">README.md</code> na
                raiz do repositório, ou o token não tem o escopo{" "}
                <code className="rounded bg-amber-100 px-1">
                  read_repository
                </code>
                . Verifique em{" "}
                <a
                  href="https://gitlab.aeb.gov.br/groups/cti/-/settings/access_tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-amber-900"
                >
                  GitLab → CTI → Access Tokens
                </a>{" "}
                se o token possui os escopos <strong>read_api</strong> e{" "}
                <strong>read_repository</strong>.
              </p>
            </div>
          )}
          {data?.readme && (
            <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.readme}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Tab: Merge Requests */}
      {activeTab === "mergerequests" && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <GitMerge size={15} /> Merge Requests
          </h2>
          {loading && <LoadingRow />}
          {!loading && !data?.mergeRequests.length && (
            <p className="text-sm text-gray-400 italic">
              Nenhum merge request encontrado.
            </p>
          )}
          <div className="divide-y divide-gray-100">
            {data?.mergeRequests.map((mr) => (
              <div key={mr.iid} className="py-3">
                <div className="flex items-start gap-3">
                  <MRStateBadge state={mr.state} />
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
      )}

      {/* Tab: Infraestrutura */}
      {activeTab === "infra" && (
        <div className="space-y-4">
          {infraLoading && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Loader2 size={14} className="animate-spin" /> Consultando
              infraestrutura…
            </div>
          )}
          {infraError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={14} /> Erro ao conectar na infraestrutura:{" "}
              {infraError}
            </div>
          )}
          {!infraLoading && !infraError && infraSource !== "none" && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              <Server size={12} /> Fonte:{" "}
              <span className="font-medium">
                {infraSource === "prometheus"
                  ? "node_exporter / Prometheus"
                  : "Nutanix Prism"}
              </span>
            </div>
          )}

          {/* VMs mapeadas ao projeto */}
          {!infraLoading && !infraError && vms.length > 0 && (
            <>
              {(
                ["producao", "homologacao", "desenvolvimento", "outro"] as const
              )
                .filter((env) => vms.some((v) => v.environment === env))
                .map((env) => {
                  const envVMs = vms.filter((v) => v.environment === env);
                  const envLabels = {
                    producao: "Produção",
                    homologacao: "Homologação",
                    desenvolvimento: "Desenvolvimento",
                    outro: "Outros",
                  };
                  const envColors = {
                    producao: "border-green-200 bg-green-50",
                    homologacao: "border-yellow-200 bg-yellow-50",
                    desenvolvimento: "border-blue-200 bg-blue-50",
                    outro: "border-gray-200 bg-gray-50",
                  };
                  return (
                    <div
                      key={env}
                      className="rounded-xl border border-gray-200 bg-white p-6"
                    >
                      <h3
                        className={clsx(
                          "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                          envColors[env],
                        )}
                      >
                        <Server size={12} /> {envLabels[env]} ({envVMs.length}{" "}
                        VM{envVMs.length > 1 ? "s" : ""})
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {envVMs.map((vm) => (
                          <VMCard key={vm.uuid} vm={vm} />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </>
          )}

          {/* Sem mapeamento por projeto — exibe todas as VMs monitoradas */}
          {!infraLoading &&
            !infraError &&
            vms.length === 0 &&
            allVms.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                  Nenhuma VM mapeada especificamente para{" "}
                  <strong>{projectKey}</strong>. Exibindo todas as VMs
                  monitoradas na rede.
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {allVms.map((vm) => (
                    <VMCard key={vm.uuid} vm={vm} />
                  ))}
                </div>
              </div>
            )}

          {/* Sem dados de nenhum tipo */}
          {!infraLoading &&
            !infraError &&
            vms.length === 0 &&
            allVms.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-400 italic">
                  Nenhuma VM encontrada. Verifique se{" "}
                  <code className="rounded bg-gray-100 px-1">
                    PROMETHEUS_URL
                  </code>{" "}
                  está configurado no{" "}
                  <code className="rounded bg-gray-100 px-1">.env</code> da VM.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
      <Loader2 size={14} className="animate-spin" /> Carregando…
    </div>
  );
}

function MRStateBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    opened: "bg-green-100 text-green-700",
    merged: "bg-purple-100 text-purple-700",
    closed: "bg-red-100 text-red-600",
  };
  const labels: Record<string, string> = {
    opened: "Aberto",
    merged: "Merged",
    closed: "Fechado",
  };
  return (
    <span
      className={clsx(
        "mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        map[state] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {labels[state] ?? state}
    </span>
  );
}

function PipelineStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-600",
    running: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    canceled: "bg-gray-100 text-gray-500",
    skipped: "bg-gray-100 text-gray-500",
  };
  const labels: Record<string, string> = {
    success: "Passou",
    failed: "Falhou",
    running: "Rodando",
    pending: "Pendente",
    canceled: "Cancelado",
    skipped: "Ignorado",
  };
  return (
    <span
      className={clsx(
        "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        map[s] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {labels[s] ?? status}
    </span>
  );
}

function VMPowerBadge({ state }: { state: string }) {
  const map: Record<string, string> = {
    ON: "bg-green-100 text-green-700",
    OFF: "bg-gray-100 text-gray-500",
    PAUSED: "bg-yellow-100 text-yellow-700",
    UNKNOWN: "bg-red-100 text-red-500",
  };
  const dots: Record<string, string> = {
    ON: "bg-green-500",
    OFF: "bg-gray-400",
    PAUSED: "bg-yellow-500",
    UNKNOWN: "bg-red-400",
  };
  return (
    <span
      className={clsx(
        "flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        map[state] ?? "bg-gray-100 text-gray-500",
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          dots[state] ?? "bg-gray-400",
        )}
      />
      {state}
    </span>
  );
}

function VMStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-white px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-0.5 text-gray-400">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="mt-0.5 text-xs font-semibold text-gray-800">{value}</p>
    </div>
  );
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

function VMCard({ vm }: { vm: InfraVM }) {
  const memLabel =
    vm.memorySizeMb >= 1024
      ? `${vm.memorySizeMb / 1024} GB`
      : `${vm.memorySizeMb} MB`;
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-mono text-sm font-semibold text-gray-800">
          {vm.name}
        </p>
        <VMPowerBadge state={vm.powerState} />
      </div>
      {vm.hostName && (
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <Server size={11} /> {vm.hostName}
        </p>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <VMStat
          icon={<Cpu size={11} />}
          label="vCPU"
          value={String(vm.numVcpus * vm.numCores)}
        />
        <VMStat icon={<MemoryStick size={11} />} label="RAM" value={memLabel} />
        <VMStat
          icon={<HardDrive size={11} />}
          label="Disco"
          value={`${vm.diskSizeGb} GB`}
        />
      </div>
      {vm.ipAddresses.length > 0 && (
        <p className="mt-2 flex items-center gap-1 font-mono text-xs text-gray-400">
          <Wifi size={11} /> {vm.ipAddresses.join(", ")}
        </p>
      )}
    </div>
  );
}
