import pool from './src/db/pool.js';

console.log('🔧 Fixing category enum values...\n');

// Check current enum
const current = await pool.query(`
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'assignment_category')
  ORDER BY enumsortorder
`);
console.log('Current categories:', current.rows.map(r => r.enumlabel));

// Alter enum - add new values
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Forensic Audits'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Internal Audit'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Statutory Audit'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Tax & Regulatory'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Transfer Pricing'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'IFC & Risk Advisory'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'GST & FEMA'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Other Services'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Management Services'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Secretarial'`);
await pool.query(`ALTER TYPE assignment_category ADD VALUE 'Corporate Finance'`);

// Verify
const updated = await pool.query(`
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'assignment_category')
  ORDER BY enumsortorder
`);
console.log('\n✅ Updated categories:', updated.rows.map(r => r.enumlabel));

await pool.end();
process.exit();