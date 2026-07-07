import type { PoolClient } from "pg";
import { query, withTransaction } from "../../db/client.js";
import type {
  AplicacaoRelacionada,
  CreateInventarioVmInput,
  InventarioVm,
  UpdateInventarioVmInput,
} from "./inventario.vm.types.js";

interface InventarioVmRow {
  id: number;
  vm: string;
  status: string | null;
  hospedeiro: string | null;
  nuvem: string | null;
  descricao: string | null;
  ipv4: string | null;
  ipv6: string | null;
  logical_network: string | null;
  so: string | null;
  vcpu: number | null;
  memoria_gb: number | null;
  disco_gb: number | null;
  tag: string | null;
  caminho: string | null;
  geracao: string | null;
}

interface AplicacaoRelacionadaRow {
  id: number;
  nome: string;
  sigla: string | null;
  vhost: string;
}

function mapInventarioVm(row: InventarioVmRow): InventarioVm {
  return {
    id: Number(row.id),
    vm: row.vm,
    status: row.status,
    hospedeiro: row.hospedeiro,
    nuvem: row.nuvem,
    descricao: row.descricao,
    ipv4: row.ipv4,
    ipv6: row.ipv6,
    logicalNetwork: row.logical_network,
    so: row.so,
    vcpu: row.vcpu,
    memoriaGb: row.memoria_gb,
    discoGb: row.disco_gb,
    tag: row.tag,
    caminho: row.caminho,
    geracao: row.geracao,
  };
}

function addUpdateField(
  fields: string[],
  params: unknown[],
  column: string,
  value: unknown,
) {
  if (value === undefined) return;

  fields.push(`${column} = $${params.length + 1}`);
  params.push(value);
}

async function ensureUniqueHost(
  client: PoolClient,
  hospedeiro: string | null,
  excludeId?: number,
) {
  if (!hospedeiro) return;

  const rows = await client.query<{ id: number }>(
    `
    SELECT id
    FROM public.inventario_vm
    WHERE hospedeiro = $1
    ${excludeId ? "AND id <> $2" : ""}
  `,
    excludeId ? [hospedeiro, excludeId] : [hospedeiro],
  );

  if (rows.rowCount && rows.rowCount > 0) {
    throw new Error("Já existe um host cadastrado com este nome");
  }
}

export async function listInventarioVms(): Promise<InventarioVm[]> {
  const rows = await query<InventarioVmRow>(`
    SELECT
      id,
      vm,
      status,
      hospedeiro,
      nuvem,
      descricao,
      ipv4,
      ipv6,
      logical_network,
      so,
      vcpu,
      memoria_gb,
      disco_gb,
      tag,
      caminho,
      geracao
    FROM public.inventario_vm
    ORDER BY vm ASC
  `);

  return rows.map(mapInventarioVm);
}

export async function findInventarioVmById(
  id: number,
): Promise<InventarioVm | null> {
  const rows = await query<InventarioVmRow>(
    `
    SELECT
      id,
      vm,
      status,
      hospedeiro,
      nuvem,
      descricao,
      ipv4,
      ipv6,
      logical_network,
      so,
      vcpu,
      memoria_gb,
      disco_gb,
      tag,
      caminho,
      geracao
    FROM public.inventario_vm
    WHERE id = $1
  `,
    [id],
  );

  if (!rows[0]) return null;

  const vm = mapInventarioVm(rows[0]);
  const aplicacoes = await listAplicacoesByVm(vm.vm);
  return { ...vm, aplicacoes };
}

export async function createInventarioVm(
  input: CreateInventarioVmInput,
): Promise<InventarioVm> {
  const created = await withTransaction(async (client) => {
    await ensureUniqueHost(client, input.hospedeiro);

    const inserted = await client.query<{ id: number }>(
      `
      INSERT INTO public.inventario_vm (
        vm,
        status,
        hospedeiro,
        nuvem,
        descricao,
        ipv4,
        ipv6,
        logical_network,
        so,
        vcpu,
        memoria_gb,
        disco_gb,
        tag,
        caminho,
        geracao
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `,
      [
        input.vm,
        input.status ?? null,
        input.hospedeiro ?? null,
        input.nuvem ?? null,
        input.descricao ?? null,
        input.ipv4 ?? null,
        input.ipv6 ?? null,
        input.logicalNetwork ?? null,
        input.so ?? null,
        input.vcpu ?? null,
        input.memoriaGb ?? null,
        input.discoGb ?? null,
        input.tag ?? null,
        input.caminho ?? null,
        input.geracao ?? null,
      ],
    );

    return inserted.rows[0].id;
  });

  return findInventarioVmById(created) as Promise<InventarioVm>;
}

export async function updateInventarioVm(
  id: number,
  input: UpdateInventarioVmInput,
): Promise<InventarioVm | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  addUpdateField(fields, params, "vm", input.vm);
  addUpdateField(fields, params, "status", input.status);
  addUpdateField(fields, params, "hospedeiro", input.hospedeiro);
  addUpdateField(fields, params, "nuvem", input.nuvem);
  addUpdateField(fields, params, "descricao", input.descricao);
  addUpdateField(fields, params, "ipv4", input.ipv4);
  addUpdateField(fields, params, "ipv6", input.ipv6);
  addUpdateField(fields, params, "logical_network", input.logicalNetwork);
  addUpdateField(fields, params, "so", input.so);
  addUpdateField(fields, params, "vcpu", input.vcpu);
  addUpdateField(fields, params, "memoria_gb", input.memoriaGb);
  addUpdateField(fields, params, "disco_gb", input.discoGb);
  addUpdateField(fields, params, "tag", input.tag);
  addUpdateField(fields, params, "caminho", input.caminho);
  addUpdateField(fields, params, "geracao", input.geracao);

  if (!fields.length) return findInventarioVmById(id);

  return withTransaction(async (client) => {
    await ensureUniqueHost(client, input.hospedeiro, id);

    params.push(id);
    await client.query(
      `
      UPDATE public.inventario_vm
      SET ${fields.join(", ")}
      WHERE id = $${params.length}
    `,
      params,
    );

    return findInventarioVmById(id);
  });
}

export async function deleteInventarioVm(id: number): Promise<boolean> {
  const deleted = await query<{ id: number }>(
    `
    DELETE FROM public.inventario_vm
    WHERE id = $1
    RETURNING id
  `,
    [id],
  );

  return deleted.length > 0;
}

export async function listAplicacoesByVm(
  vmName: string,
): Promise<AplicacaoRelacionada[]> {
  const rows = await query<AplicacaoRelacionadaRow>(
    `
    SELECT DISTINCT
      a.id,
      a.nome,
      a.sigla,
      h.vhost
    FROM public.tb_aplicacao_host h
    INNER JOIN public.tb_aplicacao a ON a.id = h.id_aplicacao
    WHERE h.vhost = $1
    ORDER BY a.nome ASC
  `,
    [vmName],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    nome: row.nome,
    sigla: row.sigla,
    vhost: row.vhost,
  }));
}
