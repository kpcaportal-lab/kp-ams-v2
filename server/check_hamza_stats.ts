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
    console.log(`Assignments for ${p.email}: ${assignments[0].count}`);
  }

  pool.end();
}
main();
