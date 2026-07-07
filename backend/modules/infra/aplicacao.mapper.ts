import type { QueryResultRow } from 'pg';
import type {
  Aplicacao,
  AplicacaoHost,
  AplicacaoUnidade,
  AplicacaoVhostInfo,
  Status,
  Unidade,
} from './infra.types.js';

export interface AplicacaoRow extends QueryResultRow {
  id: number;
  id_status: string | number;
  status_descricao: string;
  nome: string;
  descricao: string | null;
  tecnologia: string | null;
  url_versionamento: string | null;
  sigla: string | null;
}

export interface HostRow extends QueryResultRow {
  id: number;
  id_aplicacao: string | number;
  vhost: string;
}

export interface UnidadeVinculoRow extends QueryResultRow {
  id: number;
  id_aplicacao: string | number;
  id_unidade: string | number;
  unidade_descricao: string;
  unidade_sigla: string | null;
  responsavel: string;
}

export interface StatusRow extends QueryResultRow {
  id: number;
  descricao: string;
}

export interface UnidadeRow extends QueryResultRow {
  id: number;
  descricao: string;
  sigla: string | null;
}

export interface IdRow extends QueryResultRow {
  id: number;
}

export interface VhostInfoRow extends QueryResultRow {
  vhost: string;
  ipv4: string | null;
  logical_network: string | null;
  status: string | null;
  url_versionamento: string | null;
}

export function mapAplicacao(
  row: AplicacaoRow,
  hosts: AplicacaoHost[],
  unidades: AplicacaoUnidade[],
): Aplicacao {
  const id = Number(row.id);

  return {
    id,
    idStatus: Number(row.id_status),
    statusDescricao: row.status_descricao,
    nome: row.nome,
    descricao: row.descricao,
    tecnologia: row.tecnologia,
    urlVersionamento: row.url_versionamento,
    sigla: row.sigla,
    hosts: hosts.filter((host) => host.idAplicacao === id),
    unidades: unidades.filter((unidade) => unidade.idAplicacao === id),
  };
}

export function mapHost(row: HostRow): AplicacaoHost {
  return {
    id: Number(row.id),
    idAplicacao: Number(row.id_aplicacao),
    vhost: row.vhost,
  };
}

export function mapUnidadeVinculo(row: UnidadeVinculoRow): AplicacaoUnidade {
  return {
    id: Number(row.id),
    idAplicacao: Number(row.id_aplicacao),
    idUnidade: Number(row.id_unidade),
    unidadeDescricao: row.unidade_descricao,
    unidadeSigla: row.unidade_sigla,
    responsavel: row.responsavel,
  };
}

export function mapStatus(row: StatusRow): Status {
  return {
    id: Number(row.id),
    descricao: row.descricao,
  };
}

export function mapUnidade(row: UnidadeRow): Unidade {
  return {
    id: Number(row.id),
    descricao: row.descricao,
    sigla: row.sigla,
  };
}

export function mapVhostInfo(row: VhostInfoRow): AplicacaoVhostInfo {
  return {
    vhost: row.vhost,
    ipv4: row.ipv4,
    logicalNetwork: row.logical_network,
    status: row.status,
    urlVersionamento: row.url_versionamento,
  };
}
