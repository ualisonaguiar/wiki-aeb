import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  const token = process.env.VITE_GITLAB_TOKEN ?? process.env.GITLAB_TOKEN ?? '';

  res.json({
    status: 'ok',
    gitlabUrl: process.env.VITE_GITLAB_URL ?? process.env.GITLAB_URL ?? 'nao configurado',
    gitlabTokenConfigured: !!token,
    timestamp: new Date().toISOString(),
  });
});

export default router;
