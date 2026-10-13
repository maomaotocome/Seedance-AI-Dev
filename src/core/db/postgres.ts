import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { envConfigs } from '@/config';
import { isCloudflareWorker } from '@/shared/lib/env';

// Global database connection instance (singleton pattern)
let dbInstance: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export function getPostgresDb() {
  let databaseUrl = envConfigs.database_url;
  let isHyperdrive = false;

  // In Cloudflare Worker, we MUST read from the context to get bindings accurately
  if (isCloudflareWorker) {
    try {
      const context = getCloudflareContext();
      const env = context?.env as any;
      if (env) {
        if (env.HYPERDRIVE && typeof env.HYPERDRIVE === 'object') {
          databaseUrl = env.HYPERDRIVE.connectionString || databaseUrl;
          isHyperdrive = !!env.HYPERDRIVE.connectionString;
          if (isHyperdrive) console.log('Using Hyperdrive connection');
        } else if (env.DATABASE_URL) {
          databaseUrl = env.DATABASE_URL;
          console.log('Using direct DATABASE_URL from binding');
        }
      }
    } catch (e) {
      console.error('Failed to get Cloudflare context:', e);
    }
  }

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Please check your environment variables or Cloudflare bindings.'
    );
  }

  const schemaName = (envConfigs.db_schema || 'public').trim();
  const connectionSchemaOptions =
    schemaName && schemaName !== 'public'
      ? { connection: { options: `-c search_path=${schemaName}` } }
      : {};

  // In Cloudflare Workers, create new connection each time (shared connections are tricky in workerd)
  if (isCloudflareWorker) {
    const client = postgres(databaseUrl, {
      prepare: false, // Essential for Hyperdrive / Neon / Serverless poolers
      max: 1,
      idle_timeout: 10,
      connect_timeout: 15,
      // Hyperdrive handles SSL itself, client must use plaintext to local proxy
      // Direct Neon/Postgres requires SSL
      ssl: isHyperdrive ? false : { rejectUnauthorized: false },
      onnotice: () => {}, // Disable notice logs which can sometimes break in certain envs
      ...connectionSchemaOptions,
    });

    return drizzle(client);
  }

  // Singleton mode: reuse existing connection for traditional Node.js environments
  if (envConfigs.db_singleton_enabled === 'true') {
    if (dbInstance) {
      return dbInstance;
    }

    client = postgres(databaseUrl, {
      prepare: false,
      max: Number(envConfigs.db_max_connections) || 1,
      idle_timeout: 30,
      connect_timeout: 10,
      ssl: { rejectUnauthorized: false },
      ...connectionSchemaOptions,
    });

    dbInstance = drizzle(client);
    return dbInstance;
  }

  // Non-singleton mode: for standard Serverless (Vercel/AWS Lambda)
  const serverlessClient = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: false },
    ...connectionSchemaOptions,
  });

  return drizzle(serverlessClient);
}

// Optional: Function to close database connection (useful for testing or graceful shutdown)
// Note: Only works in singleton mode
export async function closePostgresDb() {
  if (envConfigs.db_singleton_enabled && client) {
    await client.end();
    client = null;
    dbInstance = null;
  }
}
