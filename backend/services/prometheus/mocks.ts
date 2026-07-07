import type { InfraHost, InfraVM } from '../infra/types.js';

export const MOCK_PROMETHEUS_VMS: InfraVM[] = [
  { uuid: 'vm-001', name: 'RESBRA-PROD-APP01', powerState: 'ON', numVcpus: 4, numCores: 2, memorySizeMb: 8192, hostName: 'HV-HOST-01', hostUuid: 'h-01', diskSizeGb: 100, ipAddresses: ['10.0.1.10'], environment: 'producao', projectKey: 'resbra' },
  { uuid: 'vm-002', name: 'RESBRA-PROD-DB01', powerState: 'ON', numVcpus: 4, numCores: 2, memorySizeMb: 16384, hostName: 'HV-HOST-01', hostUuid: 'h-01', diskSizeGb: 500, ipAddresses: ['10.0.1.11'], environment: 'producao', projectKey: 'resbra' },
  { uuid: 'vm-003', name: 'RESBRA-HOM-APP01', powerState: 'ON', numVcpus: 2, numCores: 1, memorySizeMb: 4096, hostName: 'HV-HOST-02', hostUuid: 'h-02', diskSizeGb: 80, ipAddresses: ['10.0.2.10'], environment: 'homologacao', projectKey: 'resbra' },
  { uuid: 'vm-004', name: 'RESBRA-DEV-APP01', powerState: 'OFF', numVcpus: 2, numCores: 1, memorySizeMb: 2048, hostName: null, hostUuid: null, diskSizeGb: 60, ipAddresses: [], environment: 'desenvolvimento', projectKey: 'resbra' },
  { uuid: 'vm-005', name: 'SISAPS-PROD-APP01', powerState: 'ON', numVcpus: 4, numCores: 2, memorySizeMb: 8192, hostName: 'HV-HOST-02', hostUuid: 'h-02', diskSizeGb: 120, ipAddresses: ['10.0.1.20'], environment: 'producao', projectKey: 'sisaps' },
  { uuid: 'vm-006', name: 'PORTAL-PROD-WEB01', powerState: 'ON', numVcpus: 2, numCores: 1, memorySizeMb: 4096, hostName: 'HV-HOST-01', hostUuid: 'h-01', diskSizeGb: 80, ipAddresses: ['10.0.1.30'], environment: 'producao', projectKey: 'portal' },
  { uuid: 'vm-007', name: 'INFRA-DNS-01', powerState: 'ON', numVcpus: 2, numCores: 1, memorySizeMb: 2048, hostName: 'HV-HOST-03', hostUuid: 'h-03', diskSizeGb: 40, ipAddresses: ['10.0.0.5'], environment: 'outro', projectKey: null },
];

export const MOCK_PROMETHEUS_HOSTS: InfraHost[] = [
  { uuid: 'h-01', name: 'HV-HOST-01', cpuModel: 'Intel Xeon Gold 6230', numCpuSockets: 2, numCpuCores: 20, numCpuThreads: 40, memoryCapacityMb: 196608, numVms: 3 },
  { uuid: 'h-02', name: 'HV-HOST-02', cpuModel: 'Intel Xeon Gold 6230', numCpuSockets: 2, numCpuCores: 20, numCpuThreads: 40, memoryCapacityMb: 196608, numVms: 2 },
  { uuid: 'h-03', name: 'HV-HOST-03', cpuModel: 'Intel Xeon Silver 4214', numCpuSockets: 2, numCpuCores: 12, numCpuThreads: 24, memoryCapacityMb: 131072, numVms: 1 },
];
