import { useMemo, useState } from "react";
import { useAplicacoes } from "../../hooks/useAplicacoes";
import type { InfraAplicacao } from "../../services/infra.service";
import { AplicacaoListPage } from "./AplicacaoListPage";
import { AplicacaoForm } from "./AplicacaoForm";

export function AplicacaoPage() {
  const {
    aplicacoes,
    statusOptions,
    unidades,
    loading,
    saving,
    error,
    success,
    deleteAplicacao,
    loadData,
    submitAplicacao,
    vhostIps,
    hostStatuses,
  } = useAplicacoes();

  const [activeView, setActiveView] = useState<"list" | "form">("list");
  const [selectedAplicacao, setSelectedAplicacao] =
    useState<InfraAplicacao | null>(null);
  const [viewAplicacao, setViewAplicacao] = useState<InfraAplicacao | null>(
    null,
  );

  const selectedAplicacaoForDetails = useMemo(
    () =>
      viewAplicacao
        ? (aplicacoes.find((aplicacao) => aplicacao.id === viewAplicacao.id) ??
          viewAplicacao)
        : null,
    [aplicacoes, viewAplicacao],
  );

  function handleCreate() {
    setSelectedAplicacao(null);
    setViewAplicacao(null);
    setActiveView("form");
  }

  function handleEdit(aplicacao: InfraAplicacao) {
    setSelectedAplicacao(aplicacao);
    setViewAplicacao(null);
    setActiveView("form");
  }

  function handleCancel() {
    setSelectedAplicacao(null);
    setViewAplicacao(null);
    setActiveView("list");
  }

  async function handleDelete(aplicacao: InfraAplicacao) {
    await deleteAplicacao(aplicacao);
  }

  function handleView(aplicacao: InfraAplicacao) {
    setViewAplicacao(aplicacao);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {activeView === "list" ? (
        <AplicacaoListPage
          aplicacoes={aplicacoes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreate={handleCreate}
          onRefresh={loadData}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedAplicacao ? "Editar aplicação" : "Nova aplicação"}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedAplicacao
                  ? "Atualize os dados da aplicação"
                  : "Cadastre uma nova aplicação"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </button>
          </div>
          <AplicacaoForm
            initialAplicacao={selectedAplicacao}
            onCancel={handleCancel}
            onSuccess={handleCancel}
            statusOptions={statusOptions}
            unidades={unidades}
            loading={loading}
            saving={saving}
            error={error}
            success={success}
            onSubmit={submitAplicacao}
          />
        </div>
      )}

      {selectedAplicacaoForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Hosts vinculados
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedAplicacaoForDetails.nome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewAplicacao(null)}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5">
              {selectedAplicacaoForDetails.hosts.length ? (
                <ul className="space-y-2">
                  {selectedAplicacaoForDetails.hosts.map((host) => (
                    <li
                      key={host.id}
                      className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-gray-900">
                          {host.vhost}
                        </span>
                        <span className="text-xs text-gray-500">
                          IP: {vhostIps[host.vhost] ?? "Sem IP"} (
                          {hostStatuses[host.vhost] ?? "Sem status"})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Nenhum host vinculado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
