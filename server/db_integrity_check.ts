import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const errors = [];

  try {
    // 1. Check orphaned assignments
    const { rows: orphanedAssignments } = await pool.query(`
      SELECT id FROM assignments 
      WHERE client_id NOT IN (SELECT id FROM clients)
    `);
    if (orphanedAssignments.length > 0) errors.push(`${orphanedAssignments.length} assignments have missing clients.`);

    // 2. Check orphaned invoices
    const { rows: orphanedInvoices } = await pool.query(`
      SELECT id FROM invoices 
      WHERE assignment_id NOT IN (SELECT id FROM assignments)
    `);
    if (orphanedInvoices.length > 0) errors.push(`${orphanedInvoices.length} invoices have missing assignments.`);

    // 3. Check orphaned fee allocations
    const { rows: orphanedAllocations } = await pool.query(`
      SELECT id FROM fee_allocations 
      WHERE assignment_id NOT IN (SELECT id FROM assignments)
    `);
    if (orphanedAllocations.length > 0) errors.push(`${orphanedAllocations.length} fee allocations have missing assignments.`);

    // 4. Check missing managers or partners in assignments
    const { rows: invalidUsers } = await pool.query(`
      SELECT id FROM assignments 
      WHERE manager_id NOT IN (SELECT id FROM profiles) 
         OR partner_id NOT IN (SELECT id FROM profiles)
    `);
    if (invalidUsers.length > 0) errors.push(`${invalidUsers.length} assignments have invalid manager or partner IDs.`);

    // 5. Check data anomalies (billed amount > total fees, if that's considered an error, though maybe it happens)
    const { rows: overBilled } = await pool.query(`
      SELECT id FROM assignments 
      WHERE billed_amount > total_fees AND total_fees > 0
    `);
    if (overBilled.length > 0) errors.push(`Warning: ${overBilled.length} assignments are billed for more than their total fees.`);

    // 6. Check proposals missing clients
    const { rows: orphanedProposals } = await pool.query(`
      SELECT id FROM proposals 
      WHERE client_id NOT IN (SELECT id FROM clients)
    `);
    if (orphanedProposals.length > 0) errors.push(`${orphanedProposals.length} proposals have missing clients.`);

    if (errors.length === 0) {
      console.log('✅ Database integrity check passed! No orphaned records or constraint violations found.');
    } else {
      console.log('⚠️ Database Integrity Issues Found:');
      errors.forEach(e => console.log(' - ' + e));
    }

  } catch (err) {
    console.error('Error running integrity check:', err);
  } finally {
    process.exit(0);
  }
}

main();
