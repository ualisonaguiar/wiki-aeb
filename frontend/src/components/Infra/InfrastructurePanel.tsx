import {
  AlertTriangle,
  Database,
  Eye,
  EyeOff,
  Server,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StatCard from "../../utils/StatCard";
import {
  infraService,
  InventarioVm,
  type InfraAplicacao,
} from "../../services/infra.service";
import InventarioVmPanel from "./InventarioVmPanel";

export default function InfrastructurePanel() {
  const [aplicacoes, setAplicacoes] = useState<InfraAplicacao[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [vms, setVms] = useState<InventarioVm[]>([]);
  const [mostrarRedes, setMostrarRedes] = useState(true);

  useEffect(() => {
    let mounted = true;

    setError(null);

    infraService
      .getAplicacoes()
      .then((data) => {
        if (mounted) setAplicacoes(data);
      })
      .catch((err: unknown) => {
        if (mounted) setError(String(err));
      });

    infraService
      .getInventarioVms()
      .then((data) => {
        if (mounted) {
          setVms(data);
        }
      })
      .catch((err: unknown) => {
        if (mounted) setError(String(err));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const semHosts = aplicacoes.filter(
    (aplicacao) => aplicacao.hosts.length === 0,
  ).length;

  const semUnidade = aplicacoes.filter(
    (aplicacao) => aplicacao.unidades.length === 0,
  ).length;

  const vmsPorRede = useMemo(() => {
    const contagem = vms.reduce<Record<string, number>>((acc, vm) => {
      const rede = vm.logicalNetwork || "Sem rede";
      acc[rede] = (acc[rede] ?? 0) + 1;
      return acc;
    }, {});

    // Transforma em array de pares e ordena do maior pro menor
    return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  }, [vms]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infraestrutura</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Server size={20} className="text-blue-600" />}
          label="Inventário de VM"
          value={vms.length}
        />
        <StatCard
          icon={<Database size={20} className="text-blue-600" />}
          label="Aplicações cadastradas"
          value={aplicacoes.length}
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

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">VMs por trilha</h2>
        <button
          type="button"
          onClick={() => setMostrarRedes((prev) => !prev)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          {mostrarRedes ? <EyeOff size={16} /> : <Eye size={16} />}
          {mostrarRedes ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      {mostrarRedes && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {vmsPorRede.map(([rede, total]) => (
            <StatCard
              key={rede}
              icon={<Server size={20} className="text-blue-600" />}
              label={rede}
              value={total}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <InventarioVmPanel />
    </div>
  );
}
