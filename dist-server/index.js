import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import nutanixRouter from './routes/nutanix.js';
import gitlabRouter from './routes/gitlab.js';
import prometheusRouter from './routes/prometheus.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const IS_DEV = process.env.NODE_ENV !== 'production';
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/nutanix', nutanixRouter);
app.use('/api/prometheus', prometheusRouter);
app.use('/api/gitlab', gitlabRouter);
app.get('/api/health', (_req, res) => {
    const token = process.env.VITE_GITLAB_TOKEN ?? '';
    res.json({
        status: 'ok',
        mode: IS_DEV ? 'development (mock)' : 'production',
        gitlabUrl: process.env.VITE_GITLAB_URL ?? 'não configurado',
        gitlabTokenConfigured: !!token,
        gitlabTokenPreview: token ? `${token.slice(0, 8)}...${token.slice(-4)}` : null,
        nutanixMock: !process.env.NUTANIX_URL || process.env.NUTANIX_MOCK === 'true',
        prometheusMock: !process.env.PROMETHEUS_URL || process.env.PROMETHEUS_MOCK === 'true',
        timestamp: new Date().toISOString(),
    });
});
if (!IS_DEV) {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}
app.listen(PORT, () => {
    console.log(`[wiki-server] rodando em http://0.0.0.0:${PORT}`);
    const tok = process.env.VITE_GITLAB_TOKEN ?? '';
    console.log(`[wiki-server] GitLab URL: ${process.env.VITE_GITLAB_URL ?? 'não configurado'}`);
    console.log(`[wiki-server] GitLab token: ${tok ? tok.slice(0, 8) + '...' + tok.slice(-4) : 'NÃO CONFIGURADO'}`);
    console.log(`[wiki-server] Nutanix: ${process.env.NUTANIX_URL ? process.env.NUTANIX_URL : 'MOCK ativo'}`);
    console.log(`[wiki-server] Prometheus: ${process.env.PROMETHEUS_URL ? process.env.PROMETHEUS_URL : 'MOCK ativo'}`);
});
