import { Router } from 'express';
import fetch from 'node-fetch';
import https from 'https';
const router = Router();
const GITLAB_URL = process.env.VITE_GITLAB_URL ?? 'https://gitlab.aeb.gov.br';
const GITLAB_TOKEN = process.env.VITE_GITLAB_TOKEN ?? '';
const agent = new https.Agent({ rejectUnauthorized: false });
// Verifica o token atual contra o GitLab
router.get('/token-check', async (_req, res) => {
    try {
        if (!GITLAB_TOKEN) {
            return res.status(400).json({ ok: false, error: 'VITE_GITLAB_TOKEN não configurado' });
        }
        const upstream = await fetch(`${GITLAB_URL}/api/v4/personal_access_tokens/self`, {
            headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN },
            agent,
        });
        const data = await upstream.json();
        if (!upstream.ok) {
            return res.status(upstream.status).json({ ok: false, gitlabStatus: upstream.status, gitlabError: data });
        }
        return res.json({
            ok: true,
            tokenName: data.name,
            scopes: data.scopes,
            active: data.active,
            expiresAt: data.expires_at,
            note: 'Se read_repository não estiver na lista de scopes, o README ficará indisponível.',
        });
    }
    catch (err) {
        res.status(502).json({ ok: false, error: String(err) });
    }
});
router.post('/graphql', async (req, res) => {
    try {
        const upstream = await fetch(`${GITLAB_URL}/api/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'PRIVATE-TOKEN': GITLAB_TOKEN,
            },
            body: JSON.stringify(req.body),
            agent,
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        res.status(502).json({ error: String(err) });
    }
});
// GET /graphql informativo — GraphQL só aceita POST
router.get('/graphql', (_req, res) => {
    res.status(405).json({
        error: 'GraphQL requer POST. Este endpoint aceita apenas requisições POST com body JSON.',
        hint: 'Use /api/gitlab/token-check para diagnosticar o token.',
    });
});
// Proxy genérico para a API REST v4 do GitLab
router.use(async (req, res) => {
    try {
        const path = req.path.startsWith('/') ? req.path.slice(1) : req.path;
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const upstream = await fetch(`${GITLAB_URL}/api/v4/${path}${qs}`, {
            method: req.method,
            headers: {
                'PRIVATE-TOKEN': GITLAB_TOKEN,
                'Content-Type': 'application/json',
            },
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
            agent,
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    }
    catch (err) {
        res.status(502).json({ error: String(err) });
    }
});
export default router;
