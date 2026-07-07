import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';
import https from 'https';

const router = Router();

const GITLAB_URL = (process.env.VITE_GITLAB_URL ?? process.env.GITLAB_URL ?? '')
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');
const GITLAB_TOKEN = process.env.VITE_GITLAB_TOKEN ?? process.env.GITLAB_TOKEN;

const agent = new https.Agent({ rejectUnauthorized: false });

// Verifica o token atual contra o GitLab
router.get('/token-check', async (_req: Request, res: Response) => {
  try {
    if (!GITLAB_TOKEN) {
      return res.status(400).json({ ok: false, error: 'GITLAB_TOKEN/VITE_GITLAB_TOKEN nao configurado' });
    }

    const upstream = await fetch(`${GITLAB_URL}/api/v4/personal_access_tokens/self`, {
      headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN },
      agent,
    });
    const data = await upstream.json() as Record<string, unknown>;
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
  } catch (err) {
    res.status(502).json({ ok: false, error: String(err) });
  }
});


export default router;
