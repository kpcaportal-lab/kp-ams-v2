import pool from './src/db/pool.js';

// Check for exact duplicates by full_name
const exactDupes = await pool.query(`
  SELECT full_name, COUNT(*) as cnt, array_agg(id) as ids, array_agg(email) as emails
  FROM profiles 
  WHERE is_active = true
  GROUP BY full_name 
  HAVING COUNT(*) > 1
`);
console.log('Exact duplicates by name:');
console.table(exactDupes.rows);

// Show final all users
const allUsers = await pool.query(`
  SELECT id, email, full_name, role 
  FROM profiles 
  WHERE is_active = true 
  ORDER BY role, full_name
`);
console.log('\nAll active users:');
console.table(allUsers.rows);

await pool.end();
process.exit();