import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await pool.query('BEGIN');

    // 1. Find the Mahindra client
    const { rows: mahindraRows } = await pool.query(`SELECT id FROM clients WHERE name = 'Mahindra and Mahindra Lt'`);
    if (mahindraRows.length === 0) {
      console.log('Mahindra client not found!');
      process.exit(0);
    }
    const mahindraId = mahindraRows[0].id;

    // 2. Fetch its assignments
    const { rows: assignments } = await pool.query(`SELECT id, scope_areas FROM assignments WHERE client_id = $1`, [mahindraId]);
    console.log(`Found ${assignments.length} assignments for Mahindra.`);

    for (const assignment of assignments) {
      const companyName = assignment.scope_areas.trim();
      
      // 3. Create a new client for this company name
      const { rows: newClientRows } = await pool.query(`
        INSERT INTO clients (name, status, added_by, gstn)
        VALUES ($1, 'active', '00000000-0000-0000-0000-000000000001', 'UNREGISTERED')
        RETURNING id
      `, [companyName]);
      
      const newClientId = newClientRows[0].id;

      // 4. Update the assignment to point to the new client
      await pool.query(`
        UPDATE assignments SET client_id = $1 WHERE id = $2
      `, [newClientId, assignment.id]);
      
      console.log(`Migrated assignment to new client: ${companyName}`);
    }

    // 5. Delete the old Mahindra client
    await pool.query(`DELETE FROM clients WHERE id = $1`, [mahindraId]);
    console.log('Deleted old Mahindra client.');

    await pool.query('COMMIT');
    console.log('Successfully separated Mahindra clients.');
    process.exit(0);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    process.exit(1);
  }
}

main();
