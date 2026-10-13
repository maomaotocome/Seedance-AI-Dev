import { envConfigs } from '@/config';

// import { closeMysqlDb, getMysqlDb } from './mysql';
import { closePostgresDb, getPostgresDb } from './postgres';
import { getSqliteDb } from './sqlite';

// const mysqlCompatProxyCache = new WeakMap<object, any>();
// const sqliteCompatProxyCache = new WeakMap<object, any>();

/**
 * Global fallback for Drizzle `.returning()` on dialects that don't support it (notably MySQL).
 *
 * Many call sites do: `db().insert(...).values(...).returning()`.
 * In MySQL, `.returning()` does not exist, so we polyfill it by:
 * - capturing the `.values()` / `.set()` payload
 * - executing the query
 * - returning `[payload]`
 *
 * This keeps code changes minimal while remaining compatible with Postgres/SQLite
 * (where the native `.returning()` is used).
 */
/*
function withMysqlCompat<T extends object>(dbInstance: T): T {
  // ... (implementation omitted for brevity and unused)
  return dbInstance; 
}
*/

/*
function withSqliteCompat<T extends object>(dbInstance: T): T {
    // ...
    return dbInstance;
}
*/

/**
 * Universal DB accessor.
 *
 * Drizzle returns different DB types for Postgres vs SQLite/libsql.
 * If we return a union here, TypeScript can't call methods like `db().insert(...)`
 * because the overloads are incompatible across dialects.
 *
 * So we intentionally return `any` to keep call sites stable.
 */
export function db(): any {
  if (['sqlite', 'turso'].includes(envConfigs.database_provider)) {
    return getSqliteDb() as any;
  }

  // if (envConfigs.database_provider === 'mysql') {
  //   return withMysqlCompat(getMysqlDb() as any);
  // }

  return getPostgresDb() as any;
}

export function dbPostgres(): ReturnType<typeof getPostgresDb> {
  if (envConfigs.database_provider !== 'postgresql') {
    throw new Error('Database provider is not PostgreSQL');
  }

  return getPostgresDb();
}

/*
export function dbMysql(): ReturnType<typeof getMysqlDb> {
  if (envConfigs.database_provider !== 'mysql') {
    throw new Error('Database provider is not MySQL');
  }

  return getMysqlDb();
}

export function dbSqlite(): ReturnType<typeof getSqliteDb> {
  if (!['sqlite', 'turso'].includes(envConfigs.database_provider)) {
    throw new Error('Database provider is not SQLite');
  }

  return getSqliteDb();
}
*/

export async function closeDb() {
  if (envConfigs.database_provider === 'postgresql') {
    await closePostgresDb();
    return;
  }

  if (['sqlite', 'turso'].includes(envConfigs.database_provider)) {
    return;
  }

  /*
  if (envConfigs.database_provider === 'mysql') {
    await closeMysqlDb();
    return;
  }
  */
}
