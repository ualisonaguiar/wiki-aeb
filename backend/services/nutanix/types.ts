export interface PrismVMResponse {
  entities: PrismVMEntity[];
}

export interface PrismVMEntity {
  uuid: string;
  name: string;
  power_state: string;
  num_vcpus: number;
  num_cores_per_vcpu: number;
  memory_mb: number;
  host_name?: string;
  host_uuid?: string;
  vm_disk_info?: Array<{ size?: number }>;
  vm_nics?: Array<{ ip_address?: string }>;
}

export interface PrismHostResponse {
  entities: PrismHostEntity[];
}

export interface PrismHostEntity {
  uuid: string;
  name: string;
  cpu_model?: string;
  num_cpu_sockets?: number;
  num_cpu_cores?: number;
  num_cpu_threads?: number;
  memory_capacity_in_bytes?: number;
  num_vms?: number;
}
