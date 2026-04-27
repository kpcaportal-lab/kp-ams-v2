import pool from './src/db/pool.js';

// Check category enum values
const enumVals = await pool.query(`
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'assignment_category')
`);
console.log('Valid categories:', enumVals.rows.map(r => r.enumlabel));

// Check subcategory values
const subCats = await pool.query(`
  SELECT enumlabel FROM pg_enum 
  WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'assignment_subcategory')
`);
console.log('Valid subcategories:', subCats.rows.map(r => r.enumlabel).slice(0, 10));

await pool.end();
process.exit();