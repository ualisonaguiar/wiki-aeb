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

export type InfraSource = 'prometheus' | 'nutanix' | 'none';

interface InfraResult {
    vms: InfraVM[];
    allVms: InfraVM[];
    source: InfraSource;
}

const cache: Record<string, InfraVM[]> = {};
const allCache: Record<string, InfraVM[]> = {};

/**
 * InfraService - responsável por buscar VMs em Prometheus/Nutanix
 */
export class InfraService {
    static async getInfra(projectKey: string): Promise<InfraResult> {
        if (!projectKey) {
            return {
                vms: [],
                allVms: [],
                source: 'none',
            };
        }

        const key = projectKey.toLowerCase();
        
        try {
            return await this.fetchFromPrometheus(key);
        } catch {
            return await this.fetchFromNutanix(key);
        }
    }

    private static async fetchFromPrometheus(key: string): Promise<InfraResult> {
        const [byProject, all] = await Promise.all([
            fetch(`/api/prometheus/vms/${key}`).then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return (await r.json()) as InfraVM[];
            }),

            fetch(`/api/prometheus/vms`).then(async (r) => {
                if (!r.ok) return [] as InfraVM[];
                return (await r.json()) as InfraVM[];
            }),
        ]);

        cache[key] = byProject;
        allCache[key] = all;

        return {
            vms: byProject,
            allVms: all,
            source: 'prometheus',
        };
    }

    private static async fetchFromNutanix(key: string): Promise<InfraResult> {
        try {
            const [byProject, all] = await Promise.all([
                fetch(`/api/nutanix/vms/${key}`).then(async (r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return (await r.json()) as InfraVM[];
                }),

                fetch(`/api/nutanix/vms`).then(async (r) => {
                    if (!r.ok) return [] as InfraVM[];
                    return (await r.json()) as InfraVM[];
                }),
            ]);

            cache[key] = byProject;
            allCache[key] = all;

            return {
                vms: byProject,
                allVms: all,
                source: 'nutanix',
            };
        } catch (e) {
            return {
                vms: [],
                allVms: [],
                source: 'none',
            };
        }
    }
}