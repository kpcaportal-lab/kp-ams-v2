import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function checkAssignments() {
  try {
    const res = await pool.query('SELECT DISTINCT partner_id, manager_id FROM assignments');
    console.log('--- IDs in Assignments ---');
    console.table(res.rows);
    
    const partners = await pool.query('SELECT id, full_name FROM profiles WHERE role=\'partner\'');
    console.log('--- Current Partners in Profiles ---');
    console.table(partners.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkAssignments();
