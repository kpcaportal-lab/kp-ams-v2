import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
});

async function countAssignments() {
  try {
    const res = await pool.query('SELECT count(*) FROM assignments');
    console.log('Total Assignments:', res.rows[0].count);
    
    const mahindra = await pool.query('SELECT a.id, c.name, a.total_fees FROM assignments a JOIN clients c ON c.id=a.client_id WHERE c.name LIKE \'%Mahindra%\'');
    console.log('Mahindra Assignments:');
    console.table(mahindra.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

countAssignments();
