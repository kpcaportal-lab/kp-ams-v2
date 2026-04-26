import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkLinks() {
  try {
    const res = await pool.query(`
      SELECT a.id, c.name as client_name, pp.full_name as partner_name, pm.full_name as manager_name
      FROM assignments a
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pp ON pp.id = a.partner_id
      LEFT JOIN profiles pm ON pm.id = a.manager_id
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkLinks();
