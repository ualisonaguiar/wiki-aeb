import fetch from 'node-fetch';

const PROM_URL = process.env.PROMETHEUS_URL ?? '';
const USE_MOCK = !PROM_URL || process.env.PROMETHEUS_MOCK === 'true';

// Suporte a múltiplos node_exporter targets separados por vírgula
// Ex: PROMETHEUS_URL=http://192.168.53.231:9100,http://192.168.53.232:9100
function getNodeExporterTargets(): string[] {
  if (!PROM_URL) return [];
  return PROM_URL.split(',').map((u) => u.trim()).filter(Boolean);
}

export interface PrometheusVM {
  uuid: string;
  name: string;
  powerState: 'ON' | 'OFF' | 'PAUSED' | 'UNKNOWN';
  numVcpus: number;
  numCores: number;
  memorySizeMb: number;
  hostName: string | null;
  hostUuid: string | null;
  diskSizeGb: number;
  ipAddresses: string[];
  environment: 'producao' | 'homologacao' | 'desenvolvimento' | 'outro';
  projectKey: string | null;
}

export interface PrometheusHost {
  uuid: string;
  name: string;
  cpuModel: string;
  numCpuSockets: number;
  numCpuCores: number;
  numCpuThreads: number;
  memoryCapacityMb: number;
  numVms: number;
}

function detectEnvironment(name: string): PrometheusVM['environment'] {
  const n = name.toLowerCase();
  if (n.includes('prod') || n.includes('prd'))  return 'producao';
  if (n.includes('hom') || n.includes('stg') || n.includes('staging')) return 'homologacao';
  if (n.includes('dev') || n.includes('des'))   return 'desenvolvimento';
  return 'outro';
}

function detectProject(name: string): string | null {
  const n = name.toLowerCase();
  const knownProjects = [
    'resbra', 'sisaps', 'sis-evento', 'sisbem', 'sismca',
    'sisamb', 'sisrh', 'portal', 'wiki', 'sgq',
  ];
  return knownProjects.find((p) => n.includes(p.replace('-', '').replace('_', ''))) ?? null;
}

// ---------- Parse do formato Prometheus text exposition ----------
function parseMetricValue(body: string, metricName: string, labels?: Record<string, string>): number {
  const lines = body.split('\n');
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    if (!line.startsWith(metricName)) continue;

    if (labels) {
      const labelStr = Object.entries(labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      if (!line.includes(labelStr)) continue;
    }

    const parts = line.trim().split(/\s+/);
    const last = parts[parts.length - 1];
    const val = Number(last);
    return isNaN(val) ? 0 : val;
  }
  return 0;
}

function countMetricMatches(body: string, metricName: string, labelCheck?: Record<string, string>): number {
  const lines = body.split('\n');
  let count = 0;
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    if (!line.startsWith(metricName)) continue;
    if (labelCheck) {
      const ok = Object.entries(labelCheck).every(([k, v]) => line.includes(`${k}="${v}"`));
      if (!ok) continue;
    }
    count++;
  }
  return count;
}

async function fetchNodeExporterMetrics(baseUrl: string): Promise<string> {
  const res = await fetch(`${baseUrl}/metrics`);
  if (!res.ok) throw new Error(`node_exporter ${res.status} ${res.statusText}`);
  return res.text();
}
// ---------- END Parse ----------

// ---------- MOCK DATA (fallback) ----------
const MOCK_VMS: PrometheusVM[] = [
  { uuid: 'vm-001', name: 'RESBRA-PROD-APP01',    powerState: 'ON',  numVcpus: 4, numCores: 2, memorySizeMb: 8192,  hostName: 'HV-HOST-01', hostUuid: 'h-01', diskSizeGb: 100, ipAddresses: ['10.0.1.10'], environment: 'producao',       projectKey: 'resbra' },
  { uuid: 'vm-002', name: 'RESBRA-PROD-DB01',     powerState: 'ON',  numVcpus: 4, numCores: 2, memorySizeMb: 16384, hostName: 'HV-HOST-01', hostUuid: 'h-01', diskSizeGb: 500, ipAddresses: ['10.0.1.11'], environment: 'producao',       projectKey: 'resbra' },
  { uuid: 'vm-003', name: 'RESBRA-HOM-APP01',     powerState: 'ON',  numVcpus: 2, numCores: 1, memorySizeMb: 4096,  hostName: 'HV-HOST-02', hostUuid: 'h-02', diskSizeGb: 80,  ipAddresses: ['10.0.2.10'], environment: 'homologacao',    projectKey: 'resbra' },
  { uuid: 'vm-004', name: 'RESBRA-DEV-APP01',     powerState: 'OFF', numVcpus: 2, numCores: 1, memorySizeMb: 2048,  hostName: null,           hostUuid: null,   diskSizeGb: 60,  ipAddresses: [],            environment: 'desenvolvimento', projectKey: 'resbra' },
  { uuid: 'vm-005', name: 'SISAPS-PROD-APP01',    powerState: 'ON',  numVcpus: 4, numCores: 2, memorySizeMb: 8192,  hostName: 'HV-HOST-02', hostUuid: 'h-02', diskSizeGb: 120, ipAddresses: ['10.0.1.20'], environment: 'producao',       projectKey: 'sisaps' },
  { uuid: 'vm-006', name: 'PORTAL-PROD-WEB01',    powerState: 'ON',  numVcpus: 2, numCores: 1, memorySizeMb: 4096,  hostName: 'HV-HOST-01', hostUuid: 'h-01', diskSizeGb: 80,  ipAddresses: ['10.0.1.30'], environment: 'producao',       projectKey: 'portal' },
  { uuid: 'vm-007', name: 'INFRA-DNS-01',         powerState: 'ON',  numVcpus: 2, numCores: 1, memorySizeMb: 2048,  hostName: 'HV-HOST-03', hostUuid: 'h-03', diskSizeGb: 40,  ipAddresses: ['10.0.0.5'],  environment: 'outro',          projectKey: null },
];

const MOCK_HOSTS: PrometheusHost[] = [
  { uuid: 'h-01', name: 'HV-HOST-01', cpuModel: 'Intel Xeon Gold 6230', numCpuSockets: 2, numCpuCores: 20, numCpuThreads: 40, memoryCapacityMb: 196608, numVms: 3 },
  { uuid: 'h-02', name: 'HV-HOST-02', cpuModel: 'Intel Xeon Gold 6230', numCpuSockets: 2, numCpuCores: 20, numCpuThreads: 40, memoryCapacityMb: 196608, numVms: 2 },
  { uuid: 'h-03', name: 'HV-HOST-03', cpuModel: 'Intel Xeon Silver 4214', numCpuSockets: 2, numCpuCores: 12, numCpuThreads: 24, memoryCapacityMb: 131072, numVms: 1 },
];
// ---------- END MOCK ----------

export async function listVMs(): Promise<PrometheusVM[]> {
  if (USE_MOCK) return MOCK_VMS;

  try {
    // PROMETHEUS_URL pode apontar para node_exporter direto (porta 9100)
    // ou para um servidor Prometheus (porta 9090)
    const isNodeExporter = PROM_URL.includes(':9100');

    if (isNodeExporter) {
      const targets = getNodeExporterTargets();
      const vms: PrometheusVM[] = [];
      let idx = 1;
      for (const targetUrl of targets) {
        try {
          const body = await fetchNodeExporterMetrics(targetUrl);
          const memBytes = parseMetricValue(body, 'node_memory_MemTotal_bytes');
          const cpuCount = countMetricMatches(body, 'node_cpu_seconds_total', { mode: 'idle' });
          const diskBytes = parseMetricValue(body, 'node_filesystem_size_bytes', { mountpoint: '/' });

          const hostName = targetUrl.replace(/^https?:\/\//, '').split(':')[0];

          vms.push({
            uuid: `vm-${String(idx).padStart(3, '0')}`,
            name: hostName,
            powerState: 'ON',
            numVcpus: cpuCount || 1,
            numCores: cpuCount > 0 ? Math.ceil(cpuCount / 2) : 1,
            memorySizeMb: Math.round((memBytes || 0) / 1024 / 1024) || 4096,
            hostName: null,
            hostUuid: null,
            diskSizeGb: Math.round((diskBytes || 0) / 1024 / 1024 / 1024) || 80,
            ipAddresses: [hostName],
            environment: detectEnvironment(hostName),
            projectKey: detectProject(hostName),
          });
        } catch (e) {
          console.warn(`[Prometheus] Falha ao consultar ${targetUrl}:`, e);
        }
        idx++;
      }
      return vms.length ? vms : MOCK_VMS;
    }

    // Modo Prometheus server (porta 9090)
    const upRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent('up{job=~"node_exporter|windows_exporter"}')}`);
    const upData = await upRes.json() as { data?: { result?: Array<{ metric?: { instance?: string } }> } };
    const targets = upData.data?.result ?? [];
    if (!targets.length) {
      console.warn('[Prometheus] Nenhum target encontrado. Retornando MOCK.');
      return MOCK_VMS;
    }

    const vms: PrometheusVM[] = [];
    let idx = 1;
    for (const t of targets) {
      const instance = t.metric?.instance ?? `target-${idx}`;
      const hostName = instance.split(':')[0];

      const memRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent(`node_memory_MemTotal_bytes{instance="${instance}"}`)}`);
      const memData = await memRes.json() as { data?: { result?: Array<{ value?: [number, string] }> } };
      const memBytes = Number(memData.data?.result?.[0]?.value?.[1] ?? 0);

      const cpuRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent(`count(node_cpu_seconds_total{instance="${instance}",mode="idle"})`)}`);
      const cpuData = await cpuRes.json() as { data?: { result?: Array<{ value?: [number, string] }> } };
      const cpuCount = Number(cpuData.data?.result?.[0]?.value?.[1] ?? 1);

      const diskRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent(`node_filesystem_size_bytes{instance="${instance}",mountpoint="/"}`)}`);
      const diskData = await diskRes.json() as { data?: { result?: Array<{ value?: [number, string] }> } };
      const diskBytes = Number(diskData.data?.result?.[0]?.value?.[1] ?? 0);

      vms.push({
        uuid: `vm-${String(idx).padStart(3, '0')}`,
        name: hostName,
        powerState: 'ON',
        numVcpus: cpuCount,
        numCores: cpuCount > 0 ? Math.ceil(cpuCount / 2) : 1,
        memorySizeMb: Math.round((memBytes || 0) / 1024 / 1024) || 4096,
        hostName: null,
        hostUuid: null,
        diskSizeGb: Math.round((diskBytes || 0) / 1024 / 1024 / 1024) || 80,
        ipAddresses: [hostName],
        environment: detectEnvironment(hostName),
        projectKey: detectProject(hostName),
      });
      idx++;
    }
    return vms.length ? vms : MOCK_VMS;
  } catch (err) {
    console.error('[Prometheus] listVMs error:', err);
    return MOCK_VMS;
  }
}

export async function listHosts(): Promise<PrometheusHost[]> {
  if (USE_MOCK) return MOCK_HOSTS;

  try {
    const isNodeExporter = PROM_URL.includes(':9100');

    if (isNodeExporter) {
      const targets = getNodeExporterTargets();
      const hosts: PrometheusHost[] = [];
      let idx = 1;
      for (const targetUrl of targets) {
        try {
          const body = await fetchNodeExporterMetrics(targetUrl);
          const memBytes = parseMetricValue(body, 'node_memory_MemTotal_bytes');
          const cpuCount = countMetricMatches(body, 'node_cpu_seconds_total', { mode: 'idle' });
          const hostName = targetUrl.replace(/^https?:\/\//, '').split(':')[0];

          hosts.push({
            uuid: `h-${String(idx).padStart(2, '0')}`,
            name: hostName,
            cpuModel: 'N/A',
            numCpuSockets: 1,
            numCpuCores: cpuCount || 1,
            numCpuThreads: cpuCount || 1,
            memoryCapacityMb: Math.round((memBytes || 0) / 1024 / 1024) || 65536,
            numVms: 1,
          });
        } catch (e) {
          console.warn(`[Prometheus] Falha ao consultar ${targetUrl}:`, e);
        }
        idx++;
      }
      return hosts.length ? hosts : MOCK_HOSTS;
    }

    // Modo Prometheus server
    const upRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent('up{job=~"node_exporter|windows_exporter"}')}`);
    const upData = await upRes.json() as { data?: { result?: Array<{ metric?: { instance?: string } }> } };
    const targets = upData.data?.result ?? [];
    if (!targets.length) return MOCK_HOSTS;

    const hosts: PrometheusHost[] = [];
    let idx = 1;
    for (const t of targets) {
      const instance = t.metric?.instance ?? `host-${idx}`;
      const hostName = instance.split(':')[0];

      const memRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent(`node_memory_MemTotal_bytes{instance="${instance}"}`)}`);
      const memData = await memRes.json() as { data?: { result?: Array<{ value?: [number, string] }> } };
      const memBytes = Number(memData.data?.result?.[0]?.value?.[1] ?? 0);

      const cpuRes = await fetch(`${PROM_URL}/api/v1/query?query=${encodeURIComponent(`count(node_cpu_seconds_total{instance="${instance}",mode="idle"})`)}`);
      const cpuData = await cpuRes.json() as { data?: { result?: Array<{ value?: [number, string] }> } };
      const cpuCount = Number(cpuData.data?.result?.[0]?.value?.[1] ?? 1);

      hosts.push({
        uuid: `h-${String(idx).padStart(2, '0')}`,
        name: hostName,
        cpuModel: 'N/A',
        numCpuSockets: 1,
        numCpuCores: cpuCount,
        numCpuThreads: cpuCount,
        memoryCapacityMb: Math.round((memBytes || 0) / 1024 / 1024) || 65536,
        numVms: 1,
      });
      idx++;
    }
    return hosts.length ? hosts : MOCK_HOSTS;
  } catch (err) {
    console.error('[Prometheus] listHosts error:', err);
    return MOCK_HOSTS;
  }
}

export async function getVMsByProject(projectKey: string): Promise<PrometheusVM[]> {
  const all = await listVMs();
  return all.filter((v) => v.projectKey === projectKey.toLowerCase());
}
