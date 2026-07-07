import type { Request, Response } from "express";
import * as service from "./inventario.vm.service.js";
import type {
  CreateInventarioVmInput,
  UpdateInventarioVmInput,
} from "./inventario.vm.types.js";
import { z } from "zod";

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
const createInventarioVmSchema = z.object({
  vm: z.string().trim().min(1),
  status: z.string().trim().nullable().optional(),
  hospedeiro: z.string().trim().nullable().optional(),
  nuvem: z.string().trim().nullable().optional(),
  descricao: z.string().trim().nullable().optional(),
  ipv4: z.string().trim().nullable().optional(),
  ipv6: z.string().trim().nullable().optional(),
  logicalNetwork: z.string().trim().nullable().optional(),
  so: z.string().trim().nullable().optional(),
  vcpu: z.coerce.number().int().nullable().optional(),
  memoriaGb: z.coerce.number().nullable().optional(),
  discoGb: z.coerce.number().nullable().optional(),
  tag: z.string().trim().nullable().optional(),
  caminho: z.string().trim().nullable().optional(),
  geracao: z.string().trim().nullable().optional(),
});

const updateInventarioVmSchema = createInventarioVmSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export async function listInventarioVms(_req: Request, res: Response) {
  const vms = await service.listInventarioVms();
  res.json(vms);
}

export async function getInventarioVm(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const vm = await service.getInventarioVm(id);
  res.json(vm);
}

export async function createInventarioVm(req: Request, res: Response) {
  const input = createInventarioVmSchema.parse(
    req.body,
  ) as CreateInventarioVmInput;
  const vm = await service.createInventarioVm(input);
  res.status(201).json(vm);
}

export async function updateInventarioVm(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const input = updateInventarioVmSchema.parse(
    req.body,
  ) as UpdateInventarioVmInput;
  const vm = await service.updateInventarioVm(id, input);
  res.json(vm);
}

export async function deleteInventarioVm(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await service.deleteInventarioVm(id);
  res.status(204).send();
}

export async function getAplicacoesByVm(req: Request, res: Response) {
  const { vm } = req.params;
  const aplicacoes = await service.getAplicacoesByVm(vm);
  res.json(aplicacoes);
}
