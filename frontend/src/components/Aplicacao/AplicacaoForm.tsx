import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminStatus,
  AdminUnidade,
  CreateAdminAplicacaoInput,
} from "../../services/aplicacao.service";
import type { InfraAplicacao } from "../../services/infra.service";

interface HostDraft {
  id: number;
  vhost: string;
}

interface UnidadeDraft {
  id: number;
  idUnidade: string;
  responsavel: string;
}

const emptyHost = (): HostDraft => ({
  id: Date.now() + Math.random(),
  vhost: "",
});

const emptyUnidade = (): UnidadeDraft => ({
  id: Date.now() + Math.random(),
  idUnidade: "",
  responsavel: "",
});

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

interface AplicacaoFormProps {
  initialAplicacao?: InfraAplicacao | null;
  onCancel?: () => void;
  onSuccess?: () => void;
  statusOptions: AdminStatus[];
  unidades: AdminUnidade[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onSubmit: (
    payload: CreateAdminAplicacaoInput,
    currentAplicacao?: InfraAplicacao,
  ) => Promise<unknown>;
}

export function AplicacaoForm({
  initialAplicacao = null,
  onCancel,
  onSuccess,
  statusOptions,
  unidades,
  loading,
  saving,
  error,
  success,
  onSubmit,
}: AplicacaoFormProps) {
  const [nome, setNome] = useState("");
  const [sigla, setSigla] = useState("");
  const [idStatus, setIdStatus] = useState("");
  const [tecnologia, setTecnologia] = useState("");
  const [urlVersionamento, setUrlVersionamento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [hosts, setHosts] = useState<HostDraft[]>([emptyHost()]);
  const [unidadeDrafts, setUnidadeDrafts] = useState<UnidadeDraft[]>([
    emptyUnidade(),
  ]);

  const editingAplicacaoId = useMemo(
    () => initialAplicacao?.id ?? null,
    [initialAplicacao],
  );

  useEffect(() => {
    if (initialAplicacao) {
      setNome(initialAplicacao.nome);
      setSigla(initialAplicacao.sigla ?? "");
      setIdStatus(String(initialAplicacao.idStatus));
      setTecnologia(initialAplicacao.tecnologia ?? "");
      setUrlVersionamento(initialAplicacao.urlVersionamento ?? "");
      setDescricao(initialAplicacao.descricao ?? "");
      setHosts(
        initialAplicacao.hosts.length
          ? initialAplicacao.hosts.map((host) => ({
              id: host.id,
              vhost: host.vhost,
            }))
          : [emptyHost()],
      );
      setUnidadeDrafts(
        initialAplicacao.unidades.length
          ? initialAplicacao.unidades.map((unidade) => ({
              id: unidade.id,
              idUnidade: String(unidade.idUnidade),
              responsavel: unidade.responsavel,
            }))
          : [emptyUnidade()],
      );
      return;
    }

    setNome("");
    setSigla("");
    setTecnologia("");
    setUrlVersionamento("");
    setDescricao("");
    setHosts([emptyHost()]);
    setUnidadeDrafts([emptyUnidade()]);
  }, [initialAplicacao]);

  useEffect(() => {
    if (!idStatus && statusOptions[0]) {
      setIdStatus(String(statusOptions[0].id));
    }
  }, [idStatus, statusOptions]);

  function resetForm() {
    setNome("");
    setSigla("");
    setTecnologia("");
    setUrlVersionamento("");
    setDescricao("");
    setHosts([emptyHost()]);
    setUnidadeDrafts([emptyUnidade()]);
    if (statusOptions[0]) {
      setIdStatus(String(statusOptions[0].id));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const payload: CreateAdminAplicacaoInput = {
      idStatus: Number(idStatus),
      nome: nome.trim(),
      descricao: optionalValue(descricao),
      tecnologia: optionalValue(tecnologia),
      urlVersionamento: optionalValue(urlVersionamento),
      sigla: optionalValue(sigla),
      hosts: hosts
        .map((host) => ({ vhost: host.vhost.trim() }))
        .filter((host) => host.vhost),
      unidades: unidadeDrafts
        .filter((unidade) => unidade.idUnidade && unidade.responsavel.trim())
        .map((unidade) => ({
          idUnidade: Number(unidade.idUnidade),
          responsavel: unidade.responsavel.trim(),
        })),
    };

    try {
      await onSubmit(payload, initialAplicacao ?? undefined);
      resetForm();
      onSuccess?.();
      onCancel?.();
    } catch {
      // error is handled by hook
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-gray-200 bg-white p-5"
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Nome</span>
          <input
            required
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Status</span>
          <select
            required
            value={idStatus}
            onChange={(event) => setIdStatus(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {statusOptions.map((status) => (
              <option key={status.id} value={status.id}>
                {status.descricao}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Sigla</span>
          <input
            value={sigla}
            onChange={(event) => setSigla(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Tecnologia</span>
          <input
            value={tecnologia}
            onChange={(event) => setTecnologia(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-gray-600">
            URL de versionamento
          </span>
          <input
            value={urlVersionamento}
            onChange={(event) => setUrlVersionamento(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-gray-600">Descrição</span>
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Vhosts</h2>
            <button
              type="button"
              onClick={() => setHosts((current) => [...current, emptyHost()])}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={13} />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {hosts.map((host, index) => (
              <div key={host.id} className="flex gap-2">
                <input
                  value={host.vhost}
                  onChange={(event) =>
                    setHosts((current) =>
                      current.map((item) =>
                        item.id === host.id
                          ? { ...item, vhost: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="SVLDREPOATOS"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                {hosts.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setHosts((current) =>
                        current.filter((item) => item.id !== host.id),
                      )
                    }
                    className="rounded-md border border-gray-200 px-2 text-gray-500 hover:bg-gray-50 hover:text-red-600"
                    aria-label={`Remover vhost ${index + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Unidades responsáveis
            </h2>
            <button
              type="button"
              onClick={() =>
                setUnidadeDrafts((current) => [...current, emptyUnidade()])
              }
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={13} />
              Adicionar
            </button>
          </div>

          <div className="space-y-2">
            {unidadeDrafts.map((unidade, index) => (
              <div
                key={unidade.id}
                className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_2.5rem]"
              >
                <select
                  value={unidade.idUnidade}
                  onChange={(event) =>
                    setUnidadeDrafts((current) =>
                      current.map((item) =>
                        item.id === unidade.id
                          ? { ...item, idUnidade: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className="min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">Selecione</option>
                  {unidades.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sigla
                        ? `${item.sigla} - ${item.descricao}`
                        : item.descricao}
                    </option>
                  ))}
                </select>

                <input
                  value={unidade.responsavel}
                  onChange={(event) =>
                    setUnidadeDrafts((current) =>
                      current.map((item) =>
                        item.id === unidade.id
                          ? { ...item, responsavel: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Responsável"
                  className="min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />

                {unidadeDrafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setUnidadeDrafts((current) =>
                        current.filter((item) => item.id !== unidade.id),
                      )
                    }
                    className="h-10 rounded-md border border-gray-200 px-2 text-gray-500 hover:bg-gray-50 hover:text-red-600"
                    aria-label={`Remover unidade ${index + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        {initialAplicacao && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving || loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {saving ? "Salvando..." : editingAplicacaoId ? "Salvar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
