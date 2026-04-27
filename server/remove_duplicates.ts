import pool from './src/db/pool.js';

async function removeDuplicates() {
  // Find and delete users with @kirtanepandit.com email that have duplicate with @gmail
  const result = await pool.query(`
    SELECT p.id, p.email, p.full_name, p.role
    FROM profiles p
    WHERE p.email LIKE '%@kirtanepandit.com'
    AND EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.full_name = p.full_name 
      AND p2.email LIKE '%@gmail.com'
    )
  `);
  
  console.log('Found duplicates to remove:');
  console.table(result.rows);
  
  if (result.rows.length > 0) {
    const ids = result.rows.map(r => r.id);
    const deleteResult = await pool.query(`
      DELETE FROM profiles WHERE id = ANY($1)
    `, [ids]);
    
    console.log(`Deleted ${deleteResult.rowCount} duplicate(s)`);
  }

  // Show remaining users
  const remaining = await pool.query(`
    SELECT email, full_name, role, created_at 
    FROM profiles 
    WHERE is_active = true
    ORDER BY email
  `);
  
  console.log('\n=== REMAINING USERS ===');
  console.table(remaining.rows);

  await pool.end();
  process.exit();
}

removeDuplicates().catch(e => {
  console.error(e);
  process.exit(1);
});