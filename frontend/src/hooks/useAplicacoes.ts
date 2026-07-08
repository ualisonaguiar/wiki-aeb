import { useCallback, useEffect, useState } from "react";
import {
  aplicacaoService,
  type AdminStatus,
  type AdminUnidade,
  type CreateAdminAplicacaoInput,
} from "../services/aplicacao.service";
import {
  infraService,
  type InfraAplicacao,
  type InventarioVm,
} from "../services/infra.service";

export function useAplicacoes() {
  const [aplicacoes, setAplicacoes] = useState<InfraAplicacao[]>([]);
  const [statusOptions, setStatusOptions] = useState<AdminStatus[]>([]);
  const [unidades, setUnidades] = useState<AdminUnidade[]>([]);
  const [vhostIps, setVhostIps] = useState<Record<string, string>>({});
  const [hostStatuses, setHostStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    clearMessages();

    try {
      const [
        aplicacoesData,
        statusData,
        unidadesData,
        vhostData,
        inventarioData,
      ] = await Promise.all([
        aplicacaoService.getAplicacoes(),
        aplicacaoService.getStatus(),
        aplicacaoService.getUnidades(),
        infraService.getVhostInformacoes(),
        infraService.getInventarioVms(),
      ]);

      setAplicacoes(aplicacoesData);
      setStatusOptions(statusData);
      setUnidades(unidadesData);
      setVhostIps(
        Object.fromEntries(
          vhostData
            .filter((item) => item.vhost)
            .map((item) => [item.vhost, item.ipv4 ?? "Sem IP"]),
        ),
      );
      setHostStatuses(
        Object.fromEntries(
          inventarioData
            .filter((item: InventarioVm) => item.vm)
            .map((item: InventarioVm) => [
              item.vm,
              item.status ?? "Sem status",
            ]),
        ),
      );
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [clearMessages]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const submitAplicacao = useCallback(
    async (
      payload: CreateAdminAplicacaoInput,
      currentAplicacao?: InfraAplicacao,
    ) => {
      setSaving(true);
      clearMessages();

      try {
        if (currentAplicacao) {
          const updated = await aplicacaoService.updateAplicacao(
            currentAplicacao.id,
            {
              ...payload,
              hosts: undefined,
              unidades: undefined,
            },
          );

          const currentHosts = currentAplicacao.hosts.map((host) => host.vhost);
          const nextHosts = (payload.hosts ?? [])
            .map((host) => host.vhost.trim())
            .filter(Boolean);

          const hostsToRemove = currentAplicacao.hosts.filter(
            (host) => !nextHosts.includes(host.vhost),
          );
          const hostsToAdd = nextHosts.filter(
            (host) => !currentHosts.includes(host),
          );

          await Promise.all(
            hostsToRemove.map((host) =>
              aplicacaoService.removeHost(currentAplicacao.id, host.id),
            ),
          );
          await Promise.all(
            hostsToAdd.map((host) =>
              aplicacaoService.addHost(currentAplicacao.id, { vhost: host }),
            ),
          );

          const refreshed = await aplicacaoService.getAplicacoes();
          setAplicacoes(refreshed);
          setSuccess("Aplicação atualizada com sucesso.");
          return updated;
        }

        const created = await aplicacaoService.createAplicacao(payload);
        setAplicacoes((current) => [...current, created]);
        setSuccess("Aplicação cadastrada com sucesso.");
        return created;
      } catch (err) {
        setError(String(err));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [clearMessages],
  );

  const deleteAplicacao = useCallback(
    async (aplicacao: InfraAplicacao) => {
      clearMessages();

      try {
        await aplicacaoService.deleteAplicacao(aplicacao.id);
        setAplicacoes((current) =>
          current.filter((item) => item.id !== aplicacao.id),
        );
        setSuccess("Aplicação excluída com sucesso.");
      } catch (err) {
        setError(String(err));
        throw err;
      }
    },
    [clearMessages],
  );

  return {
    aplicacoes,
    statusOptions,
    unidades,
    vhostIps,
    hostStatuses,
    loading,
    saving,
    error,
    success,
    setError,
    setSuccess,
    clearMessages,
    loadData,
    submitAplicacao,
    deleteAplicacao,
  };
}
