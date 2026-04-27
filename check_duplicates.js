const pool = require('./server/src/db/pool.js');

async function checkDuplicates() {
  // Check duplicates by email
  const emailDupes = await pool.query(`
    SELECT email, COUNT(*) as cnt, array_agg(full_name) as names, array_agg(role) as roles
    FROM profiles 
    WHERE email IS NOT NULL AND email != ''
    GROUP BY email 
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  
  console.log('=== DUPLICATE EMAILS ===');
  console.table(emailDupes.rows);

  // Check all users with their email for visual check
  const allUsers = await pool.query(`
    SELECT email, full_name, role, created_at 
    FROM profiles 
    WHERE is_active = true
    ORDER BY email, created_at
  `);
  
  console.log('=== ALL ACTIVE USERS ===');
  console.table(allUsers.rows);

  process.exit();
}

checkDuplicates().catch(e => {
  console.error(e);
  process.exit(1);
});