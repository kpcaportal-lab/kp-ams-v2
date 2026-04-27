import pool from './src/db/pool.js';

// Check Hamza's assignments
const hamzaAssignments = await pool.query(`
  SELECT a.id, a.client_id, c.name as client_name, a.category, a.manager_id, a.partner_id, a.total_fees
  FROM assignments a
  JOIN clients c ON a.client_id = c.id
  WHERE a.manager_id = '00000000-0000-0000-0000-000000000012'
`);
console.log('Hamza Assignments:', hamzaAssignments.rows.length);
console.table(hamzaAssignments.rows.slice(0, 5));

// Check if there's data
const totalClients = await pool.query(`SELECT COUNT(*) as cnt FROM clients`);
const totalAssignments = await pool.query(`SELECT COUNT(*) as cnt FROM assignments`);
console.log('\nTotal Clients:', totalClients.rows[0].cnt);
console.log('Total Assignments:', totalAssignments.rows[0].cnt);

// Check all active profiles
const profiles = await pool.query(`SELECT id, email, full_name, role, is_active FROM profiles WHERE is_active = true ORDER BY role, full_name`);
console.log('\nActive Profiles:');
console.table(profiles.rows);

await pool.end();
process.exit();