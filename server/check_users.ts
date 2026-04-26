import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkUsers() {
  try {
    const res = await pool.query('SELECT id, email, full_name, role, is_active FROM profiles ORDER BY role, full_name');
    console.log('--- USERS LIST ---');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkUsers();
