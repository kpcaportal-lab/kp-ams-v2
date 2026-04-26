import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkAssignmentsColumns() {
  try {
    const res = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'assignments\'');
    console.log('--- Assignments Columns ---');
    console.table(res.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkAssignmentsColumns();
