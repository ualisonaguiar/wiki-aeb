import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  aplicacaoService,
  type AdminStatus,
  type AdminUnidade,
  type CreateAdminAplicacaoInput,
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

export default function AdminPanel() {
  const [aplicacoes, setAplicacoes] = useState<InfraAplicacao[]>([]);
  const [statusOptions, setStatusOptions] = useState<AdminStatus[]>([]);
  const [unidades, setUnidades] = useState<AdminUnidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  function loadData() {
    setLoading(true);
    setError(null);

    Promise.all([
      aplicacaoService.getAplicacoes(),
      aplicacaoService.getStatus(),
      aplicacaoService.getUnidades(),
    ])
      .then(([aplicacoesData, statusData, unidadesData]) => {
        setAplicacoes(aplicacoesData);
        setStatusOptions(statusData);
        setUnidades(unidadesData);
        if (!idStatus && statusData[0]) setIdStatus(String(statusData[0].id));
      })
      .catch((err: unknown) => setError(String(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  const sortedAplicacoes = useMemo(
    () => [...aplicacoes].sort((a, b) => a.nome.localeCompare(b.nome)),
    [aplicacoes],
  );

  function resetForm() {
    setNome("");
    setSigla("");
    setTecnologia("");
    setUrlVersionamento("");
    setDescricao("");
    setHosts([emptyHost()]);
    setUnidadeDrafts([emptyUnidade()]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

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
      const created = await aplicacaoService.createAplicacao(payload);
      setAplicacoes((current) => [...current, created]);
      setSuccess("Aplicação cadastrada com sucesso.");
      resetForm();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Shield size={22} />
          Admin
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cadastro de aplicações, vhosts e unidades responsáveis.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-gray-200 bg-white p-5"
      >
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
            <span className="text-xs font-medium text-gray-600">
              Tecnologia
            </span>
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

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {saving ? "Salvando..." : "Cadastrar aplicação"}
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Aplicações cadastradas
          </h2>
          <p className="text-xs text-gray-500">
            {loading
              ? "Carregando..."
              : `${sortedAplicacoes.length} registro(s)`}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedAplicacoes.map((aplicacao) => (
            <div
              key={aplicacao.id}
              className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto]"
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
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
