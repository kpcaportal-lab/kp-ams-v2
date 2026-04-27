// Uses the SAME pool.ts as update_hamza_clients.ts - connects via pooler URL
import pool from './src/db/pool.ts';

async function verify() {
  try {
    // 1. Check all profiles
    console.log('\n=== ALL PROFILES ===');
    const { rows: profiles } = await pool.query('SELECT id, email, full_name, role FROM profiles ORDER BY role, full_name');
    console.table(profiles);

    // 2. Check total assignments
    console.log('\n=== TOTAL ASSIGNMENTS ===');
    const { rows: totalAssignments } = await pool.query('SELECT count(*) as total FROM assignments');
    console.log('Total assignments:', totalAssignments[0].total);

    // 3. Check Hamza's assignments specifically
    console.log('\n=== HAMZA ASSIGNMENTS ===');
    const { rows: hamzaAssignments } = await pool.query(`
      SELECT a.id, c.name as client_name, a.scope_areas, a.total_fees, a.status, a.manager_id
      FROM assignments a
      LEFT JOIN clients c ON c.id = a.client_id
      WHERE a.manager_id = '00000000-0000-0000-0000-000000000012'
      ORDER BY c.name
    `);
    console.table(hamzaAssignments);
    console.log('Hamza assignment count:', hamzaAssignments.length);

    // 4. Check all clients
    console.log('\n=== TOTAL CLIENTS ===');
    const { rows: totalClients } = await pool.query('SELECT count(*) as total FROM clients');
    console.log('Total clients:', totalClients[0].total);

    // 5. Check all tables
    console.log('\n=== TABLE ROW COUNTS ===');
    const tables = ['profiles', 'clients', 'assignments', 'proposals', 'invoices', 'fee_allocations'];
    for (const t of tables) {
      const { rows } = await pool.query(`SELECT count(*) as total FROM ${t}`);
      console.log(`  ${t}: ${rows[0].total}`);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

verify();
