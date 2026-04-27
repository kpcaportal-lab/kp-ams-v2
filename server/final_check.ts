import pool from './src/db/pool.js';

const r = await pool.query(`
  SELECT email, full_name, role 
  FROM profiles 
  WHERE is_active = true 
  ORDER BY role, full_name
`);
console.table(r.rows);
process.exit();