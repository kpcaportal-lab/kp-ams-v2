import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const { rows: profiles } = await pool.query("SELECT id, email, full_name, role FROM profiles WHERE full_name ILIKE '%Hamza%' OR email ILIKE '%hamza%'");
  console.table(profiles);

  for (const p of profiles) {
    const { rows: assignments } = await pool.query("SELECT count(*) as count FROM assignments WHERE manager_id = $1", [p.id]);
    console.log(`Assignments for ${p.email} (manager_id = ${p.id}): ${assignments[0].count}`);
    
    const { rows: assignmentsPartner } = await pool.query("SELECT count(*) as count FROM assignments WHERE partner_id = $1", [p.id]);
    console.log(`Assignments for ${p.email} (partner_id = ${p.id}): ${assignmentsPartner[0].count}`);
  }

  // Let's also check if there are assignments that belong to NO manager?
  const { rows: allAssignments } = await pool.query("SELECT manager_id, partner_id, count(*) FROM assignments GROUP BY manager_id, partner_id");
  console.log("All assignments grouped by manager:");
  console.table(allAssignments);

  pool.end();
}
main();
