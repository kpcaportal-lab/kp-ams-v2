import pool from './src/db/pool.js';

// Clean up remaining duplicates - keep @gmail, delete @kirtanepandit.com
const duplicates = await pool.query(`
  SELECT id, email, full_name, role
  FROM profiles 
  WHERE email LIKE '%@kirtanepandit.com'
  AND EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE LOWER(p2.full_name) = LOWER(profiles.full_name)
    AND p2.email LIKE '%@gmail.com'
  )
`);
console.log('Duplicates to remove:');
console.table(duplicates.rows);

if (duplicates.rows.length > 0) {
  const ids = duplicates.rows.map(r => r.id);
  await pool.query(`DELETE FROM profiles WHERE id = ANY($1)`, [ids]);
  console.log('Deleted duplicates');
}

// Final partners list
const partners = await pool.query(`SELECT id, email, full_name, role FROM profiles WHERE role = 'partner' ORDER BY full_name`);
console.log('\nPartners after cleanup:');
console.table(partners.rows);

await pool.end();
process.exit();