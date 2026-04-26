import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function testQuery() {
  try {
    const query = `
      SELECT p.id, p.email, p.role, p.full_name, p.display_name, p.is_active, p.created_at, p.reports_to, p.work_file_url,
              rp.full_name as reports_to_name
       FROM profiles p
       LEFT JOIN profiles rp ON rp.id = p.reports_to
       ORDER BY p.role, p.full_name
    `;
    const res = await pool.query(query);
    console.log('Query successful, rows:', res.rows.length);
    console.table(res.rows.slice(0, 5));
  } catch (err) {
    console.error('QUERY FAILED:', err);
  } finally {
    await pool.end();
  }
}

testQuery();
