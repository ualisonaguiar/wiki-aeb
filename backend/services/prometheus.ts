import type { InfraHost, InfraVM } from './infra/types.js';
import {
  getNodeExporterTargets,
  isNodeExporterUrl,
  PROMETHEUS_URL,
  USE_PROMETHEUS_MOCK,
} from './prometheus/config.js';
import { fetchNodeExporterMetrics, queryPrometheus } from './prometheus/client.js';
import { MOCK_PROMETHEUS_HOSTS, MOCK_PROMETHEUS_VMS } from './prometheus/mocks.js';
import {
  getHostNameFromTarget,
  mapHostMetricsToHost,
  mapHostMetricsToVM,
  mapNodeExporterToHost,
  mapNodeExporterToVM,
} from './prometheus/mappers.js';

export type PrometheusVM = InfraVM;
export type PrometheusHost = InfraHost;

export async function listVMs(): Promise<PrometheusVM[]> {
  if (USE_PROMETHEUS_MOCK) return MOCK_PROMETHEUS_VMS;

  try {
    if (isNodeExporterUrl(PROMETHEUS_URL)) {
      return await listNodeExporterVMs();
    }

    return await listPrometheusServerVMs();
  } catch (err) {
    console.error('[Prometheus] listVMs error:', err);
    return MOCK_PROMETHEUS_VMS;
  }
}

export async function listHosts(): Promise<PrometheusHost[]> {
  if (USE_PROMETHEUS_MOCK) return MOCK_PROMETHEUS_HOSTS;

  try {
    if (isNodeExporterUrl(PROMETHEUS_URL)) {
      return await listNodeExporterHosts();
    }

    return await listPrometheusServerHosts();
  } catch (err) {
    console.error('[Prometheus] listHosts error:', err);
    return MOCK_PROMETHEUS_HOSTS;
  }
}

export async function getVMsByProject(projectKey: string): Promise<PrometheusVM[]> {
  const normalizedKey = projectKey.toLowerCase();
  const all = await listVMs();

  return all.filter((vm) => vm.projectKey === normalizedKey);
}

async function listNodeExporterVMs(): Promise<PrometheusVM[]> {
  const vms: PrometheusVM[] = [];

  for (const [index, targetUrl] of getNodeExporterTargets(PROMETHEUS_URL).entries()) {
    try {
      const body = await fetchNodeExporterMetrics(targetUrl);
      vms.push(mapNodeExporterToVM(targetUrl, body, index + 1));
    } catch (err) {
      console.warn(`[Prometheus] Falha ao consultar ${targetUrl}:`, err);
    }
  }

  return vms.length ? vms : MOCK_PROMETHEUS_VMS;
}

async function listNodeExporterHosts(): Promise<PrometheusHost[]> {
  const hosts: PrometheusHost[] = [];

  for (const [index, targetUrl] of getNodeExporterTargets(PROMETHEUS_URL).entries()) {
    try {
      const body = await fetchNodeExporterMetrics(targetUrl);
      hosts.push(mapNodeExporterToHost(targetUrl, body, index + 1));
    } catch (err) {
      console.warn(`[Prometheus] Falha ao consultar ${targetUrl}:`, err);
    }
  }

  return hosts.length ? hosts : MOCK_PROMETHEUS_HOSTS;
}

async function listPrometheusServerVMs(): Promise<PrometheusVM[]> {
  const targets = await listPrometheusTargets();
  if (!targets.length) {
    console.warn('[Prometheus] Nenhum target encontrado. Retornando MOCK.');
    return MOCK_PROMETHEUS_VMS;
  }

  const vms: PrometheusVM[] = [];

  for (const [index, instance] of targets.entries()) {
    const hostName = instance.split(':')[0];
    const [memoryBytes, cpuCount, diskBytes] = await Promise.all([
      queryMetricValue(`node_memory_MemTotal_bytes{instance="${instance}"}`),
      queryMetricValue(`count(node_cpu_seconds_total{instance="${instance}",mode="idle"})`),
      queryMetricValue(`node_filesystem_size_bytes{instance="${instance}",mountpoint="/"}`),
    ]);

    vms.push(mapHostMetricsToVM({
      index: index + 1,
      hostName,
      memoryBytes,
      cpuCount,
      diskBytes,
    }));
  }

  return vms.length ? vms : MOCK_PROMETHEUS_VMS;
}

async function listPrometheusServerHosts(): Promise<PrometheusHost[]> {
  const targets = await listPrometheusTargets();
  if (!targets.length) return MOCK_PROMETHEUS_HOSTS;

  const hosts: PrometheusHost[] = [];

  for (const [index, instance] of targets.entries()) {
    const hostName = getHostNameFromTarget(instance);
    const [memoryBytes, cpuCount] = await Promise.all([
      queryMetricValue(`node_memory_MemTotal_bytes{instance="${instance}"}`),
      queryMetricValue(`count(node_cpu_seconds_total{instance="${instance}",mode="idle"})`),
    ]);

    hosts.push(mapHostMetricsToHost({
      index: index + 1,
      hostName,
      memoryBytes,
      cpuCount,
    }));
  }

  return hosts.length ? hosts : MOCK_PROMETHEUS_HOSTS;
}

async function listPrometheusTargets(): Promise<string[]> {
  const data = await queryPrometheus(
    PROMETHEUS_URL,
    'up{job=~"node_exporter|windows_exporter"}',
  );

  return data.data?.result
    ?.map((target) => target.metric?.instance)
    .filter(Boolean) as string[] ?? [];
}

async function queryMetricValue(query: string): Promise<number> {
  const data = await queryPrometheus(PROMETHEUS_URL, query);
  return Number(data.data?.result?.[0]?.value?.[1] ?? 0);
}
