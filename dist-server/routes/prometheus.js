import { Router } from 'express';
import { listVMs, listHosts, getVMsByProject } from '../services/prometheus.js';
const router = Router();
router.get('/vms', async (_req, res) => {
    try {
        const vms = await listVMs();
        res.json(vms);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
router.get('/vms/:projectKey', async (req, res) => {
    try {
        const vms = await getVMsByProject(req.params.projectKey);
        res.json(vms);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
router.get('/hosts', async (_req, res) => {
    try {
        const hosts = await listHosts();
        res.json(hosts);
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
router.get('/summary', async (_req, res) => {
    try {
        const [vms, hosts] = await Promise.all([listVMs(), listHosts()]);
        const byProject = {};
        for (const vm of vms) {
            const key = vm.projectKey ?? '__infra__';
            if (!byProject[key])
                byProject[key] = { producao: 0, homologacao: 0, desenvolvimento: 0, outro: 0 };
            byProject[key][vm.environment]++;
        }
        res.json({
            totalVMs: vms.length,
            totalHosts: hosts.length,
            totalMemoryGb: Math.round(hosts.reduce((s, h) => s + h.memoryCapacityMb, 0) / 1024),
            totalCores: hosts.reduce((s, h) => s + h.numCpuCores * h.numCpuSockets, 0),
            byProject,
        });
    }
    catch (err) {
        res.status(500).json({ error: String(err) });
    }
});
export default router;
