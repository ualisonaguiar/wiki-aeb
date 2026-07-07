import { Code2, Server } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import LanguageBar from "../LanguageBar";
import type { InfraEnvironmentCounts } from "../../hooks/useProjectRegisteredInfra";
import { getEnvironmentFromLogicalNetwork } from "../../utils/infraProjectMatch";
import type { InfraVhostInfo } from "../../services/infra.service";

interface Language {
  name: string;
  color: string;
  share: number;
}

interface Props {
  languages: Language[];
  infraEnvironmentCounts: InfraEnvironmentCounts;
  infraVhosts: InfraVhostInfo[];
  infraLoading: boolean;
  infraError: string | null;
}

const environments = [
  {
    key: "producao",
    label: "Produção",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  {
    key: "homologacao",
    label: "Homologação",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  {
    key: "desenvolvimento",
    label: "Desenvolvimento",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    key: "outro",
    label: "Outros",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
] as const;

export default function ProjectDetailOverview({
  languages,
  infraEnvironmentCounts,
  infraVhosts,
  infraLoading,
  infraError,
}: Props) {
  const langEntries = [...languages].sort((a, b) => b.share - a.share);

  const radarData = langEntries.map((l) => ({
    lang: l.name,
    pct: l.share,
  }));

  const serverCountsByEnvironment = environments.map((env) => ({
    ...env,
    count: infraEnvironmentCounts[env.key],
    vhosts: infraVhosts.filter(
      (vhost) => getEnvironmentFromLogicalNetwork(vhost.logicalNetwork) === env.key,
    ),
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Server size={15} /> Servidores por ambiente
        </h2>

        {infraLoading && (
          <p className="text-xs text-gray-500">Consultando infraestrutura...</p>
        )}

        {!infraLoading && infraError && (
          <p className="text-xs text-red-600">
            Não foi possível carregar os servidores.
          </p>
        )}

        {!infraLoading && !infraError && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {serverCountsByEnvironment.map((env) => (
              <div
                key={env.key}
                className={`rounded-lg border px-4 py-3 ${env.className}`}
              >
                <p className="text-xs font-medium">{env.label}</p>
                <p className="mt-2 text-2xl font-semibold">{env.count}</p>
                <p className="text-xs">
                  servidor{env.count === 1 ? "" : "es"}
                </p>
                {env.vhosts.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-current/20 pt-3">
                    {env.vhosts.map((vhost) => (
                      <div key={`${vhost.vhost}-${vhost.ipv4 ?? "sem-ip"}`}>
                        <p className="truncate font-mono text-xs font-semibold">
                          {vhost.vhost}
                        </p>
                        {vhost.ipv4 && (
                          <p className="mt-0.5 font-mono text-xs opacity-80">
                            {vhost.ipv4}
                          </p>
                        )}
                        {vhost.logicalNetwork && (
                          <p className="mt-0.5 text-xs opacity-80">
                            {vhost.logicalNetwork}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Code2 size={15} /> Linguagens
        </h2>
        <LanguageBar languages={languages} />
      </div>

      {/* Radar */}
      {radarData.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Distribuição Visual
          </h2>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <PolarAngleAxis dataKey="lang" tick={{ fontSize: 12 }} />
                <Radar name="Uso (%)" dataKey="pct" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3}/>
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
