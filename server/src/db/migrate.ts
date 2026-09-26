import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './index.js';

export async function runMigrations() {
  console.log('🔄 Running migrations...');
  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigrations();
