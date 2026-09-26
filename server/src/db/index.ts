import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

const rawUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/farmmitra';
const isLocalhost = rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1');

// Parse the URL to extract credentials safely (avoids issues with special chars in passwords)
function buildPoolConfig(url: string): pg.PoolConfig {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      database: parsed.pathname.replace(/^\//, ''),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
    };
  } catch {
    // Fallback: use connection string directly
    return {
      connectionString: url,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
    };
  }
}

export const pool = new pg.Pool(buildPoolConfig(rawUrl));

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });

// Helper to check DB connectivity
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection failed:', (err as Error).message);
    return false;
  }
}
