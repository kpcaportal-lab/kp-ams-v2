import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join('server', 'migrations', '023_fix_hierarchy_and_vault.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migration 023 applied successfully');
  } catch (err) {
    console.error('Migration 023 failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
