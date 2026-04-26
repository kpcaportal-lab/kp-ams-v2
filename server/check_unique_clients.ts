import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkClientIds() {
  try {
    const res = await pool.query("SELECT DISTINCT client_id FROM assignments");
    console.log('--- Unique Client IDs in Assignments ---');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkClientIds();
