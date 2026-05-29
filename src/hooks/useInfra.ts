import { useState, useEffect } from 'react';

export interface InfraVM {
  uuid: string;
  name: string;
  powerState: 'ON' | 'OFF' | 'PAUSED' | 'UNKNOWN';
  numVcpus: number;
  numCores: number;
  memorySizeMb: number;
  hostName: string | null;
  hostUuid?: string | null;
  diskSizeGb: number;
  ipAddresses: string[];
  environment: 'producao' | 'homologacao' | 'desenvolvimento' | 'outro';
  projectKey: string | null;
}

interface UseInfraResult {
  vms: InfraVM[];
  allVms: InfraVM[];
  loading: boolean;
  error: string | null;
  source: 'prometheus' | 'nutanix' | 'none';
}

const cache: Record<string, InfraVM[]> = {};
const allCache: Record<string, InfraVM[]> = {};

export function useInfra(projectKey: string): UseInfraResult {
  const [vms, setVms]         = useState<InfraVM[]>([]);
  const [allVms, setAllVms]   = useState<InfraVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [source, setSource]   = useState<'prometheus' | 'nutanix' | 'none'>('none');

  useEffect(() => {
    if (!projectKey) { setLoading(false); return; }

    const key = projectKey.toLowerCase();

    if (cache[key]) {
      setVms(cache[key]);
      setAllVms(allCache[key] ?? []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Tenta Prometheus primeiro (endpoint principal disponível na AEB)
    Promise.all([
      fetch(`/api/prometheus/vms/${key}`).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<InfraVM[]>;
      }),
      fetch(`/api/prometheus/vms`).then((r) => {
        if (!r.ok) return [] as InfraVM[];
        return r.json() as Promise<InfraVM[]>;
      }),
    ])
      .then(([byProject, all]) => {
        cache[key] = byProject;
        allCache[key] = all;
        setVms(byProject);
        setAllVms(all);
        setSource('prometheus');
      })
      .catch(() => {
        // Fallback para Nutanix
        Promise.all([
          fetch(`/api/nutanix/vms/${key}`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json() as Promise<InfraVM[]>;
          }),
          fetch(`/api/nutanix/vms`).then((r) => {
            if (!r.ok) return [] as InfraVM[];
            return r.json() as Promise<InfraVM[]>;
          }),
        ])
          .then(([byProject, all]) => {
            cache[key] = byProject;
            allCache[key] = all;
            setVms(byProject);
            setAllVms(all);
            setSource('nutanix');
          })
          .catch((e: unknown) => {
            setError(String(e));
            setSource('none');
          });
      })
      .finally(() => setLoading(false));
  }, [projectKey]);

  return { vms, allVms, loading, error, source };
}
