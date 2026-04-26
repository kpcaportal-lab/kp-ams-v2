import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await pool.query('BEGIN');

    const dummyClients = [
      'Apex Infrastructure Ltd', 
      'Sterling Finance Corporation', 
      'Zenith Retail Ventures', 
      'Meridian Technologies Pvt Ltd',
      'Nova Healthcare Systems',
      'Nova Systems',
      'Nova Healthcare Ltd'
    ];
    
    const inClause = dummyClients.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: clientsToDelete } = await pool.query(`SELECT id FROM clients WHERE name IN (${inClause})`, dummyClients);

    if (clientsToDelete.length > 0) {
      const clientIds = clientsToDelete.map(c => c.id);
      const cInClause = clientIds.map((_, i) => `$${i + 1}`).join(', ');
      
      const { rows: assignments } = await pool.query(`SELECT id FROM assignments WHERE client_id IN (${cInClause})`, clientIds);
      const aIds = assignments.map(a => a.id);
      
      if (aIds.length > 0) {
        const aInClause = aIds.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(`DELETE FROM fee_allocations WHERE assignment_id IN (${aInClause})`, aIds);
        await pool.query(`DELETE FROM invoices WHERE assignment_id IN (${aInClause})`, aIds);
      }
      await pool.query(`DELETE FROM assignments WHERE client_id IN (${cInClause})`, clientIds);
      await pool.query(`DELETE FROM proposals WHERE client_id IN (${cInClause})`, clientIds);
      await pool.query(`DELETE FROM clients WHERE id IN (${cInClause})`, clientIds);
      console.log(`Deleted dummy client data for: ${clientIds.length} clients.`);
    } else {
        console.log('No dummy clients found with those exact names.');
    }

    await pool.query('COMMIT');
    process.exit(0);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    process.exit(1);
  }
}

main();
