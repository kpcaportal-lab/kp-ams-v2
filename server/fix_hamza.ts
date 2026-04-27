import pool from './src/db/pool.js';

// Change Hamza from manager to partner
const update = await pool.query(`
  UPDATE profiles 
  SET role = 'partner'
  WHERE email = 'hamza.momin@kirtanepandit.com'
  RETURNING *
`);
console.log('Updated Hamza to partner:');
console.table(update.rows);

// Show all partners now
const partners = await pool.query(`SELECT id, email, full_name, role FROM profiles WHERE role = 'partner' ORDER BY full_name`);
console.log('\nAll partners:');
console.table(partners.rows);

await pool.end();
process.exit();