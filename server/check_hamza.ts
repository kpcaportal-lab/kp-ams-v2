import pool from './src/db/pool.js';

// Show total counts
const assignmentsCount = await pool.query(`SELECT COUNT(*) as cnt FROM assignments`);
console.log('Assignments count:', assignmentsCount.rows[0].cnt);

const clientsCount = await pool.query(`SELECT COUNT(*) as cnt FROM clients`);
console.log('Clients count:', clientsCount.rows[0].cnt);

const proposalsCount = await pool.query(`SELECT COUNT(*) as cnt FROM proposals`);
console.log('Proposals count:', proposalsCount.rows[0].cnt);

// The old Hamza was 'partner' role - let's recreate him
const checkPartner = await pool.query(`
  SELECT * FROM profiles 
  WHERE email = 'hamza.momin@kirtanepandit.com'
`);
console.log('\nHamza profiles:');
console.table(checkPartner.rows);

await pool.end();
process.exit();