import { AppError, isAppError } from '../../shared/http/errors.js';
import { checkDatabaseConnection } from '../../db/client.js';
import * as repository from './aplicacao.repository.js';
import type {
  CreateAplicacaoHostInput,
  CreateAplicacaoInput,
  CreateAplicacaoUnidadeInput,
  UpdateAplicacaoInput,
} from './infra.types.js';

export async function listAplicacoes(filters: { q?: string; idStatus?: number }) {
  return handleDatabaseErrors(() => repository.listAplicacoes(filters));
}

export async function healthCheck() {
  await handleDatabaseErrors(checkDatabaseConnection);

  return {
    status: 'ok',
    database: 'connected',
  };
}

export async function getAplicacao(id: number) {
  const aplicacao = await handleDatabaseErrors(() => repository.findAplicacaoById(id));

  if (!aplicacao) {
    throw new AppError(404, 'Aplicacao nao encontrada', 'APLICACAO_NOT_FOUND');
  }

  return aplicacao;
}

export async function createAplicacao(input: CreateAplicacaoInput) {
  return handleDatabaseErrors(() => repository.createAplicacao(input));
}

export async function updateAplicacao(id: number, input: UpdateAplicacaoInput) {
  const aplicacao = await handleDatabaseErrors(() => repository.updateAplicacao(id, input));

  if (!aplicacao) {
    throw new AppError(404, 'Aplicacao nao encontrada', 'APLICACAO_NOT_FOUND');
  }

  return aplicacao;
}

export async function deleteAplicacao(id: number) {
  const deleted = await handleDatabaseErrors(() => repository.deleteAplicacao(id));

  if (!deleted) {
    throw new AppError(404, 'Aplicacao nao encontrada', 'APLICACAO_NOT_FOUND');
  }
}

export async function addHost(idAplicacao: number, input: CreateAplicacaoHostInput) {
  await getAplicacao(idAplicacao);

  return handleDatabaseErrors(() => repository.addHost(idAplicacao, input));
}

export async function removeHost(idAplicacao: number, hostId: number) {
  const deleted = await handleDatabaseErrors(() => repository.removeHost(idAplicacao, hostId));

  if (!deleted) {
    throw new AppError(404, 'Host nao encontrado para esta aplicacao', 'HOST_NOT_FOUND');
  }
}

export async function addUnidade(idAplicacao: number, input: CreateAplicacaoUnidadeInput) {
  await getAplicacao(idAplicacao);

  return handleDatabaseErrors(() => repository.addUnidade(idAplicacao, input));
}

export async function removeUnidade(idAplicacao: number, vinculoId: number) {
  const deleted = await handleDatabaseErrors(() => repository.removeUnidade(idAplicacao, vinculoId));

  if (!deleted) {
    throw new AppError(404, 'Vinculo de unidade nao encontrado para esta aplicacao', 'UNIDADE_LINK_NOT_FOUND');
  }
}

export async function listStatus() {
  return handleDatabaseErrors(repository.listStatus);
}

export async function listUnidades() {
  return handleDatabaseErrors(repository.listUnidades);
}

export async function listVhostInformacoes() {
  return handleDatabaseErrors(repository.listVhostInformacoes);
}

async function handleDatabaseErrors<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isAppError(error)) throw error;

    const code = getDatabaseErrorCode(error);

    if (code === '23505') {
      throw new AppError(409, 'Registro duplicado', 'DATABASE_UNIQUE_VIOLATION');
    }

    if (code === '23503') {
      throw new AppError(400, 'Relacionamento invalido', 'DATABASE_FOREIGN_KEY_VIOLATION');
    }

    if (code === '23514') {
      throw new AppError(400, 'Restricao do banco violada', 'DATABASE_CHECK_VIOLATION');
    }

    if (code === '28P01') {
      throw new AppError(503, 'Falha de autenticacao no banco de dados', 'DATABASE_AUTH_FAILED');
    }

    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
      throw new AppError(503, 'Banco de dados indisponivel', 'DATABASE_UNAVAILABLE');
    }

    throw error;
  }
}

function getDatabaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;

  return 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined;
}
