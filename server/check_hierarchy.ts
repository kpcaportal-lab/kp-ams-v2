import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkHierarchy() {
  try {
    const res = await pool.query(`
      SELECT p.full_name, p.role, r.full_name as reports_to_name, p.is_active
      FROM profiles p
      LEFT JOIN profiles r ON r.id = p.reports_to
      ORDER BY p.role, p.full_name
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkHierarchy();
