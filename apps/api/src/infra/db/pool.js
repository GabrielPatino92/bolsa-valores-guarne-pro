import pg from 'pg';

const { Pool } = pg;

export function createPgPool(env) {
  return new Pool({
    connectionString: env.databaseUrl,
    max: env.databasePoolMax,
    min: env.databasePoolMin,
    ssl: env.databaseSsl ? { rejectUnauthorized: false } : false
  });
}

export async function pingDatabase(pool) {
  await pool.query('SELECT 1 AS ok');
}
