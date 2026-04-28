
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const connectionString = "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    const sql = fs.readFileSync('migrations/024_add_proposal_manager.sql', 'utf8');
    await client.query(sql);
    console.log('Migration 024 applied successfully');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
