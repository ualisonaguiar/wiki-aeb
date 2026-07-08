import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { InfraAplicacao } from "../../services/infra.service";

interface AplicacaoListPageProps {
  aplicacoes: InfraAplicacao[];
  loading: boolean;
  onEdit: (aplicacao: InfraAplicacao) => void;
  onDelete: (aplicacao: InfraAplicacao) => Promise<void>;
  onView: (aplicacao: InfraAplicacao) => void;
  onCreate: () => void;
  onRefresh: () => void;
}

export function AplicacaoListPage({
  aplicacoes,
  loading,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onRefresh,
}: AplicacaoListPageProps) {
  const [deleteTarget, setDeleteTarget] = useState<InfraAplicacao | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const sortedAplicacoes = useMemo(
    () => [...aplicacoes].sort((a, b) => a.nome.localeCompare(b.nome)),
    [aplicacoes],
  );

  const filteredAplicacoes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortedAplicacoes.filter((aplicacao) => {
      const matchesSearch =
        !normalizedSearch ||
        aplicacao.nome.toLowerCase().includes(normalizedSearch) ||
        aplicacao.sigla?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || aplicacao.statusDescricao === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, sortedAplicacoes, statusFilter]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Aplicações</h1>
          <p className="text-sm text-gray-500">
            Gerencie cadastros, vhosts e responsáveis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Atualizar
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Nova aplicação
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <label className="block flex-1 text-sm text-gray-600">
            <span className="mb-1 block font-medium">Buscar</span>
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome ou sigla"
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-1 block font-medium">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none"
            >
              <option value="all">Todos</option>
              {[
                ...new Set(
                  aplicacoes.map((aplicacao) => aplicacao.statusDescricao),
                ),
              ].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Aplicações cadastradas
          </h2>
          <p className="text-xs text-gray-500">
            {loading
              ? "Carregando..."
              : `${filteredAplicacoes.length} registro(s)`}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAplicacoes.map((aplicacao) => (
            <div
              key={aplicacao.id}
              className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <p className="font-semibold text-gray-900">{aplicacao.nome}</p>
                <p className="text-xs text-gray-500">
                  {aplicacao.sigla ?? "Sem sigla"}
                </p>
              </div>
              <div className="text-gray-600">{aplicacao.statusDescricao}</div>
              <div className="text-gray-600">
                {aplicacao.hosts.length} vhost(s)
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onView(aplicacao)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Eye size={13} />
                  Visualizar
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(aplicacao)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={13} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(aplicacao)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={13} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmar exclusão
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Deseja realmente excluir a aplicação{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.nome}
              </span>
              ?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleting ? "Excluindo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
