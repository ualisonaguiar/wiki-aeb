import type { InfraHost, InfraVM } from './infra/types.js';
import { USE_NUTANIX_MOCK } from './nutanix/config.js';
import { prismGet } from './nutanix/client.js';
import { MOCK_NUTANIX_HOSTS, MOCK_NUTANIX_VMS } from './nutanix/mocks.js';
import { mapPrismHost, mapPrismVM } from './nutanix/mappers.js';
import type { PrismHostResponse, PrismVMResponse } from './nutanix/types.js';

export type NutanixVM = InfraVM;
export type NutanixHost = InfraHost;

export async function listVMs(): Promise<NutanixVM[]> {
  if (USE_NUTANIX_MOCK) return MOCK_NUTANIX_VMS;

  try {
    const data = await prismGet<PrismVMResponse>(
      '/api/nutanix/v2.0/vms/?include_vm_disk_config=true&include_vm_nic_config=true',
    );

    return data.entities.map(mapPrismVM);
  } catch (err) {
    console.error('[Nutanix] listVMs error:', err);
    return [];
  }
}

export async function listHosts(): Promise<NutanixHost[]> {
  if (USE_NUTANIX_MOCK) return MOCK_NUTANIX_HOSTS;

  try {
    const data = await prismGet<PrismHostResponse>('/api/nutanix/v2.0/hosts/');

    return data.entities.map(mapPrismHost);
  } catch (err) {
    console.error('[Nutanix] listHosts error:', err);
    return [];
  }
}

export async function getVMsByProject(projectKey: string): Promise<NutanixVM[]> {
  const normalizedKey = projectKey.toLowerCase();
  const all = await listVMs();

  return all.filter((vm) => vm.projectKey === normalizedKey);
}
