import pool from './src/db/pool.js';

console.log('🔧 Fixing subcategory enum values...\n');

// Check current
const current = await pool.query(`
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'assignment_subcategory')
  ORDER BY enumsortorder
  LIMIT 10
`);
console.log('Current subcategories:', current.rows.map(r => r.enumlabel));

// Add readable values (if not exist)
const newSubcats = ['Forensic Investigation', 'Forensic Audits', 'Due Diligence', 'Regulatory Investigation'];
for (const sc of newSubcats) {
  try {
    await pool.query(`ALTER TYPE assignment_subcategory ADD VALUE $1`, [sc]);
    console.log('✅ Added:', sc);
  } catch (e: any) {
    if (e.code === '42P07') console.log('Exists:', sc);
    else console.log('Skip:', sc);
  }
}

await pool.end();
process.exit();