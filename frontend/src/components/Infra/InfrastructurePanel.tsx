import { Activity, AlertTriangle, Database, Search, Server, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StatCard from "../../utils/StatCard";
import { infraService, type InfraAplicacao } from "../../services/infra.service";

function getPrimaryResponsavel(aplicacao: InfraAplicacao) {
  return aplicacao.unidades[0]?.responsavel ?? "Sem responsavel";
}

function getUnidadesLabel(aplicacao: InfraAplicacao) {
  if (!aplicacao.unidades.length) return "Sem unidade";

  return aplicacao.unidades
    .map((unidade) => unidade.unidadeSigla ?? unidade.unidadeDescricao)
    .join(", ");
}

function isActiveStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  return normalized === "ativo" || normalized.startsWith("ativo ");
}

function StatusBadge({ status }: { status: string }) {
  const active = isActiveStatus(status);

  return (
    <span
      className={
        active
          ? "inline-flex rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
          : "inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
      }
    >
      {status}
    </span>
  );
}

export default function InfrastructurePanel() {
  const [aplicacoes, setAplicacoes] = useState<InfraAplicacao[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    infraService
      .getAplicacoes()
      .then((data) => {
        if (mounted) setAplicacoes(data);
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
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return aplicacoes;

    return aplicacoes.filter((aplicacao) =>
      [
        aplicacao.nome,
        aplicacao.sigla,
        aplicacao.statusDescricao,
        aplicacao.tecnologia,
        aplicacao.descricao,
        ...aplicacao.hosts.map((host) => host.vhost),
        ...aplicacao.unidades.map((unidade) => unidade.responsavel),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [aplicacoes, search]);

  const totalAtivos = aplicacoes.filter((aplicacao) =>
    isActiveStatus(aplicacao.statusDescricao),
  ).length;
  const semHosts = aplicacoes.filter((aplicacao) => aplicacao.hosts.length === 0).length;
  const semUnidade = aplicacoes.filter((aplicacao) => aplicacao.unidades.length === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infraestrutura</h1>
          <p className="mt-1 text-sm text-gray-500">
            Aplicacoes cadastradas, vinculos de unidade e vhosts operacionais.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar aplicacao..."
            className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Database size={20} className="text-blue-600" />}
          label="Aplicacoes cadastradas"
          value={aplicacoes.length}
        />
        <StatCard
          icon={<Activity size={20} className="text-green-600" />}
          label="Aplicacoes ativas"
          value={totalAtivos}
        />
        <StatCard
          icon={<Server size={20} className="text-amber-600" />}
          label="Sem vhost"
          value={semHosts}
        />
        <StatCard
          icon={<Users size={20} className="text-purple-600" />}
          label="Sem unidade"
          value={semUnidade}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Aplicacoes</h2>
          <p className="text-xs text-gray-500">
            {loading ? "Carregando dados..." : `${filtered.length} registro(s) encontrado(s)`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Aplicacao
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tecnologia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Vhosts
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Unidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Responsavel
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Carregando infraestrutura...
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Nenhuma aplicacao encontrada.
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((aplicacao) => (
                  <tr key={aplicacao.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{aplicacao.nome}</div>
                      <div className="text-xs text-gray-500">{aplicacao.sigla ?? "Sem sigla"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={aplicacao.statusDescricao} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {aplicacao.tecnologia ?? "Nao informada"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {aplicacao.hosts.length ? aplicacao.hosts.map((host) => host.vhost).join(", ") : "Sem vhost"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{getUnidadesLabel(aplicacao)}</td>
                    <td className="px-4 py-3 text-gray-700">{getPrimaryResponsavel(aplicacao)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
