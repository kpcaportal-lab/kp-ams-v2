import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const { rows } = await pool.query('SELECT name FROM clients');
  console.log('Current Clients:', rows.map(r => r.name).join(', '));
  process.exit(0);
}

main();
