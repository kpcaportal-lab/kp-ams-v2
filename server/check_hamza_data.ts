import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    console.log('--- USERS AND ROLES ---');
    const users = await pool.query('SELECT full_name, email, role FROM profiles');
    console.table(users.rows);

    console.log('\n--- HAMZA MOMIN DATA ---');
    const hamza = await pool.query("SELECT id FROM profiles WHERE full_name = 'Hamza Momin'");
    if (hamza.rows.length === 0) {
      console.log('Hamza Momin profile NOT FOUND');
    } else {
      const hId = hamza.rows[0].id;
      console.log('Hamza ID:', hId);
      const assignments = await pool.query("SELECT id, client_name, scope_item FROM assignments WHERE manager_id = $1", [hId]);
      console.log('Assignments for Hamza:', assignments.rows);
      
      const allAssignments = await pool.query("SELECT id, client_name, manager_id FROM assignments");
      console.log('All Assignments Manager IDs:', allAssignments.rows);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
