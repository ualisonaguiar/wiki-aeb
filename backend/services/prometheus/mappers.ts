import type { InfraHost, InfraVM } from '../infra/types.js';
import { detectEnvironment, detectProject } from '../infra/detection.js';
import { countMetricMatches, parseMetricValue } from './parser.js';

export function getHostNameFromTarget(targetUrl: string): string {
  return targetUrl.replace(/^https?:\/\//, '').split(':')[0];
}

export function mapNodeExporterToVM(targetUrl: string, body: string, index: number): InfraVM {
  const hostName = getHostNameFromTarget(targetUrl);
  const memBytes = parseMetricValue(body, 'node_memory_MemTotal_bytes');
  const cpuCount = countMetricMatches(body, 'node_cpu_seconds_total', { mode: 'idle' });
  const diskBytes = parseMetricValue(body, 'node_filesystem_size_bytes', { mountpoint: '/' });

  return mapHostMetricsToVM({
    index,
    hostName,
    memoryBytes: memBytes,
    cpuCount,
    diskBytes,
  });
}

export function mapNodeExporterToHost(targetUrl: string, body: string, index: number): InfraHost {
  const hostName = getHostNameFromTarget(targetUrl);
  const memBytes = parseMetricValue(body, 'node_memory_MemTotal_bytes');
  const cpuCount = countMetricMatches(body, 'node_cpu_seconds_total', { mode: 'idle' });

  return mapHostMetricsToHost({
    index,
    hostName,
    memoryBytes: memBytes,
    cpuCount,
  });
}

export function mapHostMetricsToVM(params: {
  index: number;
  hostName: string;
  memoryBytes: number;
  cpuCount: number;
  diskBytes: number;
}): InfraVM {
  const { index, hostName, memoryBytes, cpuCount, diskBytes } = params;

  return {
    uuid: `vm-${String(index).padStart(3, '0')}`,
    name: hostName,
    powerState: 'ON',
    numVcpus: cpuCount || 1,
    numCores: cpuCount > 0 ? Math.ceil(cpuCount / 2) : 1,
    memorySizeMb: Math.round((memoryBytes || 0) / 1024 / 1024) || 4096,
    hostName: null,
    hostUuid: null,
    diskSizeGb: Math.round((diskBytes || 0) / 1024 / 1024 / 1024) || 80,
    ipAddresses: [hostName],
    environment: detectEnvironment(hostName),
    projectKey: detectProject(hostName),
  };
}

export function mapHostMetricsToHost(params: {
  index: number;
  hostName: string;
  memoryBytes: number;
  cpuCount: number;
}): InfraHost {
  const { index, hostName, memoryBytes, cpuCount } = params;

  return {
    uuid: `h-${String(index).padStart(2, '0')}`,
    name: hostName,
    cpuModel: 'N/A',
    numCpuSockets: 1,
    numCpuCores: cpuCount || 1,
    numCpuThreads: cpuCount || 1,
    memoryCapacityMb: Math.round((memoryBytes || 0) / 1024 / 1024) || 65536,
    numVms: 1,
  };
}
