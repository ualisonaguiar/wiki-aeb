import { useState, useEffect } from 'react';

export interface NutanixVM {
  uuid: string;
  name: string;
  powerState: 'ON' | 'OFF' | 'PAUSED' | 'UNKNOWN';
  numVcpus: number;
  numCores: number;
  memorySizeMb: number;
  hostName: string | null;
  diskSizeGb: number;
  ipAddresses: string[];
  environment: 'producao' | 'homologacao' | 'desenvolvimento' | 'outro';
  projectKey: string | null;
}

interface UseNutanixResult {
  vms: NutanixVM[];
  loading: boolean;
  error: string | null;
}

const cache: Record<string, NutanixVM[]> = {};

const API_BASE = '/api/nutanix';

export function useNutanix(projectKey: string): UseNutanixResult {
  const [vms, setVms]       = useState<NutanixVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!projectKey) { setLoading(false); return; }

    const key = projectKey.toLowerCase();

    if (cache[key]) {
      setVms(cache[key]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/vms/${key}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<NutanixVM[]>;
      })
      .then((data) => {
        cache[key] = data;
        setVms(data);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [projectKey]);

  return { vms, loading, error };
}
