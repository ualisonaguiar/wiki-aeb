import type { Request, Response } from 'express';
import * as service from './aplicacao.service.js';
import {
  createAplicacaoHostSchema,
  createAplicacaoSchema,
  createAplicacaoUnidadeSchema,
  hostIdParamSchema,
  idParamSchema,
  listAplicacoesQuerySchema,
  unidadeIdParamSchema,
  updateAplicacaoSchema,
} from './infra.schemas.js';

export async function healthCheck(_req: Request, res: Response) {
  const health = await service.healthCheck();

  res.json(health);
}

export async function listAplicacoes(req: Request, res: Response) {
  const filters = listAplicacoesQuerySchema.parse(req.query);
  const aplicacoes = await service.listAplicacoes(filters);

  res.json(aplicacoes);
}

export async function getAplicacao(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const aplicacao = await service.getAplicacao(id);

  res.json(aplicacao);
}

export async function createAplicacao(req: Request, res: Response) {
  const input = createAplicacaoSchema.parse(req.body);
  const aplicacao = await service.createAplicacao(input);

  res.status(201).json(aplicacao);
}

export async function updateAplicacao(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = updateAplicacaoSchema.parse(req.body);
  const aplicacao = await service.updateAplicacao(id, input);

  res.json(aplicacao);
}

export async function deleteAplicacao(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await service.deleteAplicacao(id);

  res.status(204).send();
}

export async function addHost(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = createAplicacaoHostSchema.parse(req.body);
  const host = await service.addHost(id, input);

  res.status(201).json(host);
}

export async function removeHost(req: Request, res: Response) {
  const { id, hostId } = hostIdParamSchema.parse(req.params);
  await service.removeHost(id, hostId);

  res.status(204).send();
}

export async function addUnidade(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = createAplicacaoUnidadeSchema.parse(req.body);
  const unidade = await service.addUnidade(id, input);

  res.status(201).json(unidade);
}

export async function removeUnidade(req: Request, res: Response) {
  const { id, vinculoId } = unidadeIdParamSchema.parse(req.params);
  await service.removeUnidade(id, vinculoId);

  res.status(204).send();
}

export async function listStatus(_req: Request, res: Response) {
  const status = await service.listStatus();

  res.json(status);
}

export async function listUnidades(_req: Request, res: Response) {
  const unidades = await service.listUnidades();

  res.json(unidades);
}

export async function listVhostInformacoes(_req: Request, res: Response) {
  const vhosts = await service.listVhostInformacoes();

  res.json(vhosts);
}
