import type { InfraHost, InfraVM } from '../infra/types.js';
import { detectEnvironment, detectProject } from '../infra/detection.js';
import type { PrismHostEntity, PrismVMEntity } from './types.js';

export function mapPrismVM(entity: PrismVMEntity): InfraVM {
  const diskBytes = (entity.vm_disk_info ?? []).reduce((sum, disk) => sum + (disk.size ?? 0), 0);
  const ips = (entity.vm_nics ?? [])
    .map((nic) => nic.ip_address)
    .filter(Boolean) as string[];

  return {
    uuid: entity.uuid,
    name: entity.name,
    powerState: (entity.power_state?.toUpperCase() ?? 'UNKNOWN') as InfraVM['powerState'],
    numVcpus: entity.num_vcpus ?? 0,
    numCores: entity.num_cores_per_vcpu ?? 1,
    memorySizeMb: entity.memory_mb ?? 0,
    hostName: entity.host_name ?? null,
    hostUuid: entity.host_uuid ?? null,
    diskSizeGb: Math.round(diskBytes / 1024 / 1024 / 1024),
    ipAddresses: ips,
    environment: detectEnvironment(entity.name),
    projectKey: detectProject(entity.name),
  };
}

export function mapPrismHost(entity: PrismHostEntity): InfraHost {
  return {
    uuid: entity.uuid,
    name: entity.name,
    cpuModel: entity.cpu_model ?? 'N/A',
    numCpuSockets: entity.num_cpu_sockets ?? 0,
    numCpuCores: entity.num_cpu_cores ?? 0,
    numCpuThreads: entity.num_cpu_threads ?? 0,
    memoryCapacityMb: Math.round((entity.memory_capacity_in_bytes ?? 0) / 1024 / 1024),
    numVms: entity.num_vms ?? 0,
  };
}
