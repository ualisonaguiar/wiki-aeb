import { AlertTriangle, Server, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { infraService, type InventarioVm } from "../../services/infra.service";

export default function InventarioVmPanel() {
  const [vms, setVms] = useState<InventarioVm[]>([]);
  const [selectedVm, setSelectedVm] = useState<InventarioVm | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    infraService
      .getInventarioVms()
      .then((data) => {
        if (mounted) {
          setVms(data);
          if (data[0]) setSelectedVm(data[0]);
        }
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
    if (!term) return vms;

    return vms.filter((vm) =>
      [vm.vm, vm.hospedeiro, vm.nuvem, vm.so, vm.descricao, vm.ipv4, vm.ipv6]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [vms, search]);

  useEffect(() => {
    if (!selectedVm && filtered[0]) {
      setSelectedVm(filtered[0]);
    }
  }, [filtered, selectedVm]);

  const handleSelectVm = async (vm: InventarioVm) => {
    setSelectedVm(vm);
    try {
      const aplicacoes = await infraService.getAplicacoesPorVm(vm.vm);
      setSelectedVm((current) =>
        current?.id === vm.id ? { ...current, aplicacoes } : current,
      );
    } catch {
      setSelectedVm((current) =>
        current?.id === vm.id ? { ...current, aplicacoes: [] } : current,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventário de hosts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie hosts, consulte detalhes e veja quais aplicações estão
            relacionadas a cada um.
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
            placeholder="Buscar host ou IP..."
            className="w-full rounded-md border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Hosts</h2>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-6 text-sm text-gray-500">
                Carregando hosts...
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="px-4 py-6 text-sm text-gray-500">
                Nenhum host encontrado.
              </div>
            )}

            {!loading &&
              filtered.map((vm) => (
                <button
                  key={vm.id}
                  type="button"
                  onClick={() => handleSelectVm(vm)}
                  className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition ${selectedVm?.id === vm.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Server size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {vm.vm}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {vm.hospedeiro ?? "Sem hospedeiro"}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {selectedVm ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedVm.vm}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedVm.descricao ?? "Sem descrição"}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Hospedeiro
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVm.hospedeiro ?? "Não informado"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Nuvem
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVm.nuvem ?? "Não informado"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVm.status ?? "Não informado"}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    IPv4
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedVm.ipv4 ?? "Não informado"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Aplicações relacionadas
                  </h3>
                </div>

                {!selectedVm.aplicacoes?.length ? (
                  <p className="text-sm text-gray-500">
                    Nenhuma aplicação encontrada para este host.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedVm.aplicacoes.map((aplicacao) => (
                      <li
                        key={`${aplicacao.id}-${aplicacao.vhost}`}
                        className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                      >
                        <div className="font-medium text-gray-900">
                          {aplicacao.nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          {aplicacao.sigla ?? "Sem sigla"} · {aplicacao.vhost}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Selecione um host para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
