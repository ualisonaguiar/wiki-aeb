import fetch from 'node-fetch';
import https from 'https';
const PRISM_URL = process.env.NUTANIX_URL ?? '';
const PRISM_USER = process.env.NUTANIX_USER ?? '';
const PRISM_PASS = process.env.NUTANIX_PASS ?? '';
const USE_MOCK = !PRISM_URL || process.env.NUTANIX_MOCK === 'true';
const agent = new https.Agent({ rejectUnauthorized: false });
function basicAuth() {
    return 'Basic ' + Buffer.from(`${PRISM_USER}:${PRISM_PASS}`).toString('base64');
}
async function prismGet(path) {
    const res = await fetch(`${PRISM_URL}${path}`, {
        headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' },
        agent,
    });
    if (!res.ok)
        throw new Error(`Prism ${res.status} ${res.statusText}`);
    return res.json();
}
async function prismPost(path, body) {
    const res = await fetch(`${PRISM_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        agent,
    });
    if (!res.ok)
        throw new Error(`Prism ${res.status} ${res.statusText}`);
    return res.json();
}
function detectEnvironment(name) {
    const n = name.toLowerCase();
    if (n.includes('prod') || n.includes('prd'))
        return 'producao';
    if (n.includes('hom') || n.includes('stg') || n.includes('staging'))
        return 'homologacao';
    if (n.includes('dev') || n.includes('des'))
        return 'desenvolvimento';
    return 'outro';
}
function detectProject(name) {
    const n = name.toLowerCase();
    const knownProjects = [
        'resbra', 'sisaps', 'sis-evento', 'sisbem', 'sismca',
        'sisamb', 'sisrh', 'portal', 'wiki', 'sgq',
    ];
    return knownProjects.find((p) => n.includes(p.replace('-', '').replace('_', ''))) ?? null;
}
// ---------- MOCK DATA ----------
const MOCK_VMS = [
    { uuid: 'vm-001', name: 'RESBRA-PROD-APP01', powerState: 'ON', numVcpus: 4, numCores: 2, memorySizeMb: 8192, hostName: 'HOST-NODE-01', hostUuid: 'h-01', diskSizeGb: 100, ipAddresses: ['10.0.1.10'], environment: 'producao', projectKey: 'resbra' },
    { uuid: 'vm-002', name: 'RESBRA-PROD-DB01', powerState: 'ON', numVcpus: 4, numCores: 2, memorySizeMb: 16384, hostName: 'HOST-NODE-01', hostUuid: 'h-01', diskSizeGb: 500, ipAddresses: ['10.0.1.11'], environment: 'producao', projectKey: 'resbra' },
    { uuid: 'vm-003', name: 'RESBRA-HOM-APP01', powerState: 'ON', numVcpus: 2, numCores: 1, memorySizeMb: 4096, hostName: 'HOST-NODE-02', hostUuid: 'h-02', diskSizeGb: 80, ipAddresses: ['10.0.2.10'], environment: 'homologacao', projectKey: 'resbra' },
    { uuid: 'vm-004', name: 'RESBRA-DEV-APP01', powerState: 'OFF', numVcpus: 2, numCores: 1, memorySizeMb: 2048, hostName: null, hostUuid: null, diskSizeGb: 60, ipAddresses: [], environment: 'desenvolvimento', projectKey: 'resbra' },
    { uuid: 'vm-005', name: 'SISAPS-PROD-APP01', powerState: 'ON', numVcpus: 4, numCores: 2, memorySizeMb: 8192, hostName: 'HOST-NODE-02', hostUuid: 'h-02', diskSizeGb: 120, ipAddresses: ['10.0.1.20'], environment: 'producao', projectKey: 'sisaps' },
    { uuid: 'vm-006', name: 'PORTAL-PROD-WEB01', powerState: 'ON', numVcpus: 2, numCores: 1, memorySizeMb: 4096, hostName: 'HOST-NODE-01', hostUuid: 'h-01', diskSizeGb: 80, ipAddresses: ['10.0.1.30'], environment: 'producao', projectKey: 'portal' },
    { uuid: 'vm-007', name: 'INFRA-DNS-01', powerState: 'ON', numVcpus: 2, numCores: 1, memorySizeMb: 2048, hostName: 'HOST-NODE-03', hostUuid: 'h-03', diskSizeGb: 40, ipAddresses: ['10.0.0.5'], environment: 'outro', projectKey: null },
];
const MOCK_HOSTS = [
    { uuid: 'h-01', name: 'HOST-NODE-01', cpuModel: 'Intel Xeon Gold 6230', numCpuSockets: 2, numCpuCores: 20, numCpuThreads: 40, memoryCapacityMb: 196608, numVms: 3 },
    { uuid: 'h-02', name: 'HOST-NODE-02', cpuModel: 'Intel Xeon Gold 6230', numCpuSockets: 2, numCpuCores: 20, numCpuThreads: 40, memoryCapacityMb: 196608, numVms: 2 },
    { uuid: 'h-03', name: 'HOST-NODE-03', cpuModel: 'Intel Xeon Silver 4214', numCpuSockets: 2, numCpuCores: 12, numCpuThreads: 24, memoryCapacityMb: 131072, numVms: 1 },
];
// ---------- END MOCK ----------
export async function listVMs() {
    if (USE_MOCK)
        return MOCK_VMS;
    try {
        // Prism Element v2 API
        const data = await prismGet('/api/nutanix/v2.0/vms/?include_vm_disk_config=true&include_vm_nic_config=true');
        return data.entities.map((v) => {
            const diskGb = (v.vm_disk_info ?? []).reduce((s, d) => s + (d.size ?? 0), 0) / 1024 / 1024 / 1024;
            const ips = (v.vm_nics ?? []).map((n) => n.ip_address).filter(Boolean);
            return {
                uuid: v.uuid,
                name: v.name,
                powerState: (v.power_state?.toUpperCase() ?? 'UNKNOWN'),
                numVcpus: v.num_vcpus ?? 0,
                numCores: v.num_cores_per_vcpu ?? 1,
                memorySizeMb: v.memory_mb ?? 0,
                hostName: v.host_name ?? null,
                hostUuid: v.host_uuid ?? null,
                diskSizeGb: Math.round(diskGb),
                ipAddresses: ips,
                environment: detectEnvironment(v.name),
                projectKey: detectProject(v.name),
            };
        });
    }
    catch (err) {
        console.error('[Nutanix] listVMs error:', err);
        return [];
    }
}
export async function listHosts() {
    if (USE_MOCK)
        return MOCK_HOSTS;
    try {
        const data = await prismGet('/api/nutanix/v2.0/hosts/');
        return data.entities.map((h) => ({
            uuid: h.uuid,
            name: h.name,
            cpuModel: h.cpu_model ?? 'N/A',
            numCpuSockets: h.num_cpu_sockets ?? 0,
            numCpuCores: h.num_cpu_cores ?? 0,
            numCpuThreads: h.num_cpu_threads ?? 0,
            memoryCapacityMb: Math.round((h.memory_capacity_in_bytes ?? 0) / 1024 / 1024),
            numVms: h.num_vms ?? 0,
        }));
    }
    catch (err) {
        console.error('[Nutanix] listHosts error:', err);
        return [];
    }
}
export async function getVMsByProject(projectKey) {
    const all = await listVMs();
    return all.filter((v) => v.projectKey === projectKey.toLowerCase());
}
