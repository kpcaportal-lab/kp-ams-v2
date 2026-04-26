import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkCounts() {
  const tables = ['profiles', 'clients', 'proposals', 'assignments', 'invoices', 'fee_allocations'];
  try {
    for (const table of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${res.rows[0].count}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkCounts();
