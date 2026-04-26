import pg from 'pg';
import fs from 'fs';
import path from 'path';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

const migrationsDir = path.join(process.cwd(), 'server', 'migrations');

async function forceMigrate() {
  const client = await pool.connect();
  try {
    const files = fs.readdirSync(migrationsDir).sort();
    console.log(`Found ${files.length} migrations.`);

    for (const file of files) {
      const version = parseInt(file.split('_')[0]);
      if (version >= 12) {
        console.log(`Running migration ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        try {
          await client.query(sql);
          console.log(`✅ ${file} success`);
        } catch (err: any) {
          console.warn(`⚠️ ${file} error (might already exist):`, err.message);
        }
      }
    }
    console.log('Migration process completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

forceMigrate();
