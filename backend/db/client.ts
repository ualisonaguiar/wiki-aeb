import pg from 'pg';
import type { PoolClient, QueryResultRow } from 'pg';
import { AppError } from '../shared/http/errors.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new AppError(
      503,
      'DATABASE_URL nao configurada',
      'DATABASE_NOT_CONFIGURED',
    );
  }

  pool ??= new Pool({ connectionString });

  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getDbPool().query<T>(text, params);
  return result.rows;
}

export async function checkDatabaseConnection(): Promise<void> {
  await getDbPool().query('SELECT 1');
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDbPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
