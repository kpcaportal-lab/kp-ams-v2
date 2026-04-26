import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const { rows } = await pool.query(`
    SELECT a.id, a.scope_item, a.scope_areas, c.name 
    FROM assignments a
    JOIN clients c ON c.id = a.client_id
    WHERE c.name = 'Mahindra and Mahindra Lt'
  `);
  console.log('Assignments for Mahindra:');
  console.table(rows);
  process.exit(0);
}

main();
