import { z } from 'zod';

const idSchema = z.coerce.number().int().positive();
const optionalTextSchema = z.string().trim().min(1).nullable().optional();

export const idParamSchema = z.object({
  id: idSchema,
});

export const hostIdParamSchema = z.object({
  id: idSchema,
  hostId: idSchema,
});

export const unidadeIdParamSchema = z.object({
  id: idSchema,
  vinculoId: idSchema,
});

export const createAplicacaoHostSchema = z.object({
  vhost: z.string().trim().min(1),
});

export const createAplicacaoUnidadeSchema = z.object({
  idUnidade: idSchema,
  responsavel: z.string().trim().min(1),
});

export const createAplicacaoSchema = z.object({
  idStatus: idSchema,
  nome: z.string().trim().min(1),
  descricao: optionalTextSchema,
  tecnologia: optionalTextSchema,
  urlVersionamento: optionalTextSchema,
  sigla: optionalTextSchema,
  hosts: z.array(createAplicacaoHostSchema).optional(),
  unidades: z.array(createAplicacaoUnidadeSchema).optional(),
});

export const updateAplicacaoSchema = z.object({
  idStatus: idSchema.optional(),
  nome: z.string().trim().min(1).optional(),
  descricao: optionalTextSchema,
  tecnologia: optionalTextSchema,
  urlVersionamento: optionalTextSchema,
  sigla: optionalTextSchema,
}).refine((payload) => Object.keys(payload).length > 0, {
  message: 'Informe ao menos um campo para atualizar',
});

export const listAplicacoesQuerySchema = z.object({
  q: z.string().trim().optional(),
  idStatus: idSchema.optional(),
});
