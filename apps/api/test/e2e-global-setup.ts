import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

function requireTestDatabaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error(
      'E2E tests require DATABASE_URL to point to a dedicated test database.',
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('E2E DATABASE_URL must be a valid PostgreSQL URL.');
  }

  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new Error('E2E DATABASE_URL must use the PostgreSQL protocol.');
  }

  const databaseName = decodeURIComponent(url.pathname.slice(1)).toLowerCase();
  const clearlyTestScoped = /(^|[-_])(test|e2e|ci)([-_]|$)/.test(databaseName);
  if (!clearlyTestScoped) {
    throw new Error(
      'E2E DATABASE_URL must clearly identify a test database (for example kinetiq_test or kinetiq_e2e).',
    );
  }

  return value;
}

async function resetPublicTables(databaseUrl: string): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const result = await pool.query<{ tablename: string }>(
      `SELECT tablename
       FROM pg_catalog.pg_tables
       WHERE schemaname = 'public'
         AND tablename <> '_prisma_migrations'`,
    );
    const tables = result.rows
      .map(({ tablename }) => `"public"."${tablename.replaceAll('"', '""')}"`)
      .join(', ');
    if (tables) {
      await pool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await pool.end();
  }
}

export default async function globalSetup(): Promise<void> {
  const apiRoot = resolve(__dirname, '..');
  dotenv.config({ path: resolve(apiRoot, '.env.test') });
  process.env.NODE_ENV = 'test';
  const databaseUrl = requireTestDatabaseUrl();

  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: 'test' },
    stdio: 'inherit',
  });
  await resetPublicTables(databaseUrl);
  execFileSync('pnpm', ['exec', 'prisma', 'db', 'seed'], {
    cwd: apiRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: 'test' },
    stdio: 'inherit',
  });
}
