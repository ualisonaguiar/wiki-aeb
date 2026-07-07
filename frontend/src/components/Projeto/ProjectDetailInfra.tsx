import { AlertTriangle, Code2, ExternalLink, Network, Server, Tag, Users, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import {
  type InfraAplicacao,
  type InfraVhostInfo,
} from "../../services/infra.service";

interface Props {
  aplicacao: InfraAplicacao | null;
  vhosts: InfraVhostInfo[];
  loading: boolean;
  error: string | null;
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export default function ProjectDetailInfra({ aplicacao, vhosts, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Consultando infraestrutura cadastrada...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertTriangle size={16} />
        Nao foi possivel carregar a infraestrutura cadastrada.
      </div>
    );
  }

  if (!aplicacao) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-900">Infraestrutura cadastrada</h2>
        <p className="mt-2 text-sm text-gray-500">
          Nenhuma infraestrutura cadastrada foi encontrada para este projeto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{aplicacao.nome}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {aplicacao.descricao ?? "Sem descricao cadastrada."}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
            {aplicacao.statusDescricao}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoItem
            icon={<Tag size={13} />}
            label="Sigla"
            value={aplicacao.sigla ?? "Nao informada"}
          />
          <InfoItem
            icon={<Code2 size={13} />}
            label="Tecnologia"
            value={aplicacao.tecnologia ?? "Nao informada"}
          />
          <InfoItem
            icon={<Server size={13} />}
            label="Vhosts"
            value={vhosts.length || aplicacao.hosts.length}
          />
          <InfoItem
            icon={<Users size={13} />}
            label="Unidades"
            value={aplicacao.unidades.length}
          />
        </div>

        {aplicacao.urlVersionamento && (
          <a
            href={aplicacao.urlVersionamento}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            <ExternalLink size={14} />
            Abrir versionamento cadastrado
          </a>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Server size={15} />
            Vhosts
          </h3>

          {vhosts.length === 0 && aplicacao.hosts.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum vhost cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {(vhosts.length ? vhosts : aplicacao.hosts.map((host) => ({
                vhost: host.vhost,
                ipv4: null,
                logicalNetwork: null,
                status: null,
                urlVersionamento: aplicacao.urlVersionamento,
              }))).map((host) => (
                <div
                  key={`${host.vhost}-${host.ipv4 ?? "sem-ip"}`}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-900">{host.vhost}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                        {host.ipv4 && (
                          <span className="inline-flex items-center gap-1">
                            <Wifi size={12} />
                            {host.ipv4}
                          </span>
                        )}
                        {host.logicalNetwork && (
                          <span className="inline-flex items-center gap-1">
                            <Network size={12} />
                            {host.logicalNetwork}
                          </span>
                        )}
                      </div>
                    </div>

                    {host.status && (
                      <span className="inline-flex w-fit rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        {host.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Users size={15} />
            Unidades responsaveis
          </h3>

          {aplicacao.unidades.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma unidade cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {aplicacao.unidades.map((unidade) => (
                <div key={unidade.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {unidade.unidadeSigla ?? unidade.unidadeDescricao}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{unidade.unidadeDescricao}</p>
                  <p className="mt-2 text-sm text-gray-700">{unidade.responsavel}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
