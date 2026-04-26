import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    console.log('--- ALL USERS ---');
    const users = await pool.query('SELECT id, full_name, email, role FROM profiles ORDER BY role');
    console.table(users.rows);

    console.log('\n--- ALL ASSIGNMENTS ---');
    const assignments = await pool.query(`
      SELECT a.id, c.name as client_name, a.scope_item, a.manager_id, a.partner_id 
      FROM assignments a
      JOIN clients c ON c.id = a.client_id
    `);
    console.table(assignments.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
