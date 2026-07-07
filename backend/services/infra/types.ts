export type InfraEnvironment =
  | 'producao'
  | 'homologacao'
  | 'desenvolvimento'
  | 'outro';

export type InfraPowerState = 'ON' | 'OFF' | 'PAUSED' | 'UNKNOWN';

export interface InfraVM {
  uuid: string;
  name: string;
  powerState: InfraPowerState;
  numVcpus: number;
  numCores: number;
  memorySizeMb: number;
  hostName: string | null;
  hostUuid: string | null;
  diskSizeGb: number;
  ipAddresses: string[];
  environment: InfraEnvironment;
  projectKey: string | null;
}

export interface InfraHost {
  uuid: string;
  name: string;
  cpuModel: string;
  numCpuSockets: number;
  numCpuCores: number;
  numCpuThreads: number;
  memoryCapacityMb: number;
  numVms: number;
}
