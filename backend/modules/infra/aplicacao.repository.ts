import type { PoolClient } from "pg";
import { query, withTransaction } from "../../db/client.js";
import type {
  Aplicacao,
  AplicacaoHost,
  AplicacaoUnidade,
  AplicacaoVhostInfo,
  CreateAplicacaoHostInput,
  CreateAplicacaoInput,
  CreateAplicacaoUnidadeInput,
  Status,
  Unidade,
  UpdateAplicacaoInput,
} from "./infra.types.js";
import {
  type AplicacaoRow,
  type HostRow,
  type IdRow,
  type StatusRow,
  type UnidadeRow,
  type UnidadeVinculoRow,
  type VhostInfoRow,
  mapAplicacao,
  mapHost,
  mapStatus,
  mapUnidade,
  mapUnidadeVinculo,
  mapVhostInfo,
} from "./aplicacao.mapper.js";

interface ListAplicacoesFilters {
  q?: string;
  idStatus?: number;
}

export async function listAplicacoes(
  filters: ListAplicacoesFilters = {},
): Promise<Aplicacao[]> {
  const params: unknown[] = [];
  const where: string[] = [];

  if (filters.q) {
    params.push(`%${filters.q}%`);
    where.push(
      `(a.nome ILIKE $${params.length} OR a.sigla ILIKE $${params.length})`,
    );
  }

  if (filters.idStatus) {
    params.push(filters.idStatus);
    where.push(`a.id_status = $${params.length}`);
  }

  const rows = await query<AplicacaoRow>(
    `
    SELECT
      a.id,
      a.id_status,
      s.descricao AS status_descricao,
      a.nome,
      a.descricao,
      a.tecnologia,
      a.url_versionamento,
      a.sigla
    FROM public.tb_aplicacao a
    INNER JOIN public.tb_status s ON s.id = a.id_status
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY a.nome ASC
  `,
    params,
  );

  return hydrateAplicacoes(rows);
}

export async function findAplicacaoById(id: number): Promise<Aplicacao | null> {
  const rows = await query<AplicacaoRow>(
    `
    SELECT
      a.id,
      a.id_status,
      s.descricao AS status_descricao,
      a.nome,
      a.descricao,
      a.tecnologia,
      a.url_versionamento,
      a.sigla
    FROM public.tb_aplicacao a
    INNER JOIN public.tb_status s ON s.id = a.id_status
    WHERE a.id = $1
  `,
    [id],
  );

  const [aplicacao] = await hydrateAplicacoes(rows);
  return aplicacao ?? null;
}

export async function createAplicacao(
  input: CreateAplicacaoInput,
): Promise<Aplicacao> {
  const aplicacaoId = await withTransaction(async (client) => {
    const inserted = await client.query<IdRow>(
      `
      INSERT INTO public.tb_aplicacao (
        id_status,
        nome,
        descricao,
        tecnologia,
        url_versionamento,
        sigla
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
      [
        input.idStatus,
        input.nome,
        input.descricao ?? null,
        input.tecnologia ?? null,
        input.urlVersionamento ?? null,
        input.sigla ?? null,
      ],
    );

    const insertedId = Number(inserted.rows[0].id);

    for (const host of input.hosts ?? []) {
      await insertHost(client, insertedId, host);
    }

    for (const unidade of input.unidades ?? []) {
      await insertUnidade(client, insertedId, unidade);
    }

    return insertedId;
  });

  const aplicacao = await findAplicacaoById(aplicacaoId);
  if (!aplicacao)
    throw new Error("Aplicacao criada, mas nao encontrada apos insert");

  return aplicacao;
}

export async function updateAplicacao(
  id: number,
  input: UpdateAplicacaoInput,
): Promise<Aplicacao | null> {
  const fields: string[] = [];
  const params: unknown[] = [];

  addUpdateField(fields, params, "id_status", input.idStatus);
  addUpdateField(fields, params, "nome", input.nome);
  addUpdateField(fields, params, "descricao", input.descricao);
  addUpdateField(fields, params, "tecnologia", input.tecnologia);
  addUpdateField(fields, params, "url_versionamento", input.urlVersionamento);
  addUpdateField(fields, params, "sigla", input.sigla);

  if (!fields.length) return findAplicacaoById(id);

  params.push(id);

  const rows = await query<IdRow>(
    `
    UPDATE public.tb_aplicacao
    SET ${fields.join(", ")}
    WHERE id = $${params.length}
    RETURNING id
  `,
    params,
  );

  if (!rows.length) return null;

  return findAplicacaoById(id);
}

export async function deleteAplicacao(id: number): Promise<boolean> {
  return withTransaction(async (client) => {
    await client.query(
      "DELETE FROM public.tb_aplicacao_host WHERE id_aplicacao = $1",
      [id],
    );
    await client.query(
      "DELETE FROM public.tb_aplicacao_unidade WHERE id_aplicacao = $1",
      [id],
    );

    const deleted = await client.query(
      "DELETE FROM public.tb_aplicacao WHERE id = $1 RETURNING id",
      [id],
    );
    return (deleted.rowCount ?? 0) > 0;
  });
}

export async function addHost(
  idAplicacao: number,
  input: CreateAplicacaoHostInput,
): Promise<AplicacaoHost> {
  const rows = await query<HostRow>(
    `
    INSERT INTO public.tb_aplicacao_host (id_aplicacao, vhost)
    VALUES ($1, $2)
    RETURNING id, id_aplicacao, vhost
  `,
    [idAplicacao, input.vhost],
  );

  return mapHost(rows[0]);
}

export async function removeHost(
  idAplicacao: number,
  hostId: number,
): Promise<boolean> {
  const rows = await query<IdRow>(
    `
    DELETE FROM public.tb_aplicacao_host
    WHERE id = $1 AND id_aplicacao = $2
    RETURNING id
  `,
    [hostId, idAplicacao],
  );

  return rows.length > 0;
}

export async function addUnidade(
  idAplicacao: number,
  input: CreateAplicacaoUnidadeInput,
): Promise<AplicacaoUnidade> {
  const rows = await query<UnidadeVinculoRow>(
    `
    WITH inserted AS (
      INSERT INTO public.tb_aplicacao_unidade (id_aplicacao, id_unidade, responsavel)
      VALUES ($1, $2, $3)
      RETURNING id, id_aplicacao, id_unidade, responsavel
    )
    SELECT
      i.id,
      i.id_aplicacao,
      i.id_unidade,
      u.descricao AS unidade_descricao,
      u.sigla AS unidade_sigla,
      i.responsavel
    FROM inserted i
    INNER JOIN public.tb_unidade u ON u.id = i.id_unidade
  `,
    [idAplicacao, input.idUnidade, input.responsavel],
  );

  return mapUnidadeVinculo(rows[0]);
}

export async function removeUnidade(
  idAplicacao: number,
  vinculoId: number,
): Promise<boolean> {
  const rows = await query<IdRow>(
    `
    DELETE FROM public.tb_aplicacao_unidade
    WHERE id = $1 AND id_aplicacao = $2
    RETURNING id
  `,
    [vinculoId, idAplicacao],
  );

  return rows.length > 0;
}

export async function listStatus(): Promise<Status[]> {
  const rows = await query<StatusRow>(`
    SELECT id, descricao
    FROM public.tb_status
    ORDER BY descricao ASC
  `);

  return rows.map(mapStatus);
}

export async function listUnidades(): Promise<Unidade[]> {
  const rows = await query<UnidadeRow>(`
    SELECT id, descricao, sigla
    FROM public.tb_unidade
    ORDER BY sigla NULLS LAST, descricao ASC
  `);

  return rows.map(mapUnidade);
}

export async function listVhostInformacoes(): Promise<AplicacaoVhostInfo[]> {
  const rows = await query<VhostInfoRow>(`
    SELECT
      vhost,
      ipv4,
      logical_network,
      status,
      url_versionamento
    FROM public.vw_informacao_vhost_aplicacao
    ORDER BY url_versionamento NULLS LAST, vhost ASC
  `);

  return rows.map(mapVhostInfo);
}

async function hydrateAplicacoes(rows: AplicacaoRow[]): Promise<Aplicacao[]> {
  if (!rows.length) return [];

  const ids = rows.map((row) => Number(row.id));
  const [hosts, unidades] = await Promise.all([
    findHostsByAplicacaoIds(ids),
    findUnidadesByAplicacaoIds(ids),
  ]);

  return rows.map((row) => mapAplicacao(row, hosts, unidades));
}

async function findHostsByAplicacaoIds(
  ids: number[],
): Promise<AplicacaoHost[]> {
  const rows = await query<HostRow>(
    `
    SELECT id, id_aplicacao, vhost
    FROM public.tb_aplicacao_host
    WHERE id_aplicacao = ANY($1::bigint[])
    ORDER BY vhost ASC
  `,
    [ids],
  );

  return rows.map(mapHost);
}

async function findUnidadesByAplicacaoIds(
  ids: number[],
): Promise<AplicacaoUnidade[]> {
  const rows = await query<UnidadeVinculoRow>(
    `
    SELECT
      au.id,
      au.id_aplicacao,
      au.id_unidade,
      u.descricao AS unidade_descricao,
      u.sigla AS unidade_sigla,
      au.responsavel
    FROM public.tb_aplicacao_unidade au
    INNER JOIN public.tb_unidade u ON u.id = au.id_unidade
    WHERE au.id_aplicacao = ANY($1::bigint[])
    ORDER BY u.sigla NULLS LAST, u.descricao ASC
  `,
    [ids],
  );

  return rows.map(mapUnidadeVinculo);
}

async function insertHost(
  client: PoolClient,
  idAplicacao: number,
  input: CreateAplicacaoHostInput,
): Promise<void> {
  await client.query(
    `
    INSERT INTO public.tb_aplicacao_host (id_aplicacao, vhost)
    VALUES ($1, $2)
  `,
    [idAplicacao, input.vhost],
  );
}

async function insertUnidade(
  client: PoolClient,
  idAplicacao: number,
  input: CreateAplicacaoUnidadeInput,
): Promise<void> {
  await client.query(
    `
    INSERT INTO public.tb_aplicacao_unidade (id_aplicacao, id_unidade, responsavel)
    VALUES ($1, $2, $3)
  `,
    [idAplicacao, input.idUnidade, input.responsavel],
  );
}

function addUpdateField(
  fields: string[],
  params: unknown[],
  column: string,
  value: unknown,
): void {
  if (value === undefined) return;

  params.push(value);
  fields.push(`${column} = $${params.length}`);
}
