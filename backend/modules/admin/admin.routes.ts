import { Router } from 'express';
import { asyncHandler } from '../../shared/http/async-handler.js';
import {
  createAplicacaoHostSchema,
  createAplicacaoSchema,
  createAplicacaoUnidadeSchema,
  hostIdParamSchema,
  idParamSchema,
  unidadeIdParamSchema,
  updateAplicacaoSchema,
} from '../infra/infra.schemas.js';
import * as aplicacaoService from '../infra/aplicacao.service.js';

const router = Router();

router.get('/aplicacoes', asyncHandler(async (_req, res) => {
  const aplicacoes = await aplicacaoService.listAplicacoes({});

  res.json(aplicacoes);
}));

router.post('/aplicacoes', asyncHandler(async (req, res) => {
  const input = createAplicacaoSchema.parse(req.body);
  const aplicacao = await aplicacaoService.createAplicacao(input);

  res.status(201).json(aplicacao);
}));

router.put('/aplicacoes/:id', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = updateAplicacaoSchema.parse(req.body);
  const aplicacao = await aplicacaoService.updateAplicacao(id, input);

  res.json(aplicacao);
}));

router.delete('/aplicacoes/:id', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await aplicacaoService.deleteAplicacao(id);

  res.status(204).send();
}));

router.post('/aplicacoes/:id/hosts', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = createAplicacaoHostSchema.parse(req.body);
  const host = await aplicacaoService.addHost(id, input);

  res.status(201).json(host);
}));

router.delete('/aplicacoes/:id/hosts/:hostId', asyncHandler(async (req, res) => {
  const { id, hostId } = hostIdParamSchema.parse(req.params);
  await aplicacaoService.removeHost(id, hostId);

  res.status(204).send();
}));

router.post('/aplicacoes/:id/unidades', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = createAplicacaoUnidadeSchema.parse(req.body);
  const unidade = await aplicacaoService.addUnidade(id, input);

  res.status(201).json(unidade);
}));

router.delete('/aplicacoes/:id/unidades/:vinculoId', asyncHandler(async (req, res) => {
  const { id, vinculoId } = unidadeIdParamSchema.parse(req.params);
  await aplicacaoService.removeUnidade(id, vinculoId);

  res.status(204).send();
}));

router.get('/status', asyncHandler(async (_req, res) => {
  const status = await aplicacaoService.listStatus();

  res.json(status);
}));

router.get('/unidades', asyncHandler(async (_req, res) => {
  const unidades = await aplicacaoService.listUnidades();

  res.json(unidades);
}));

export default router;
