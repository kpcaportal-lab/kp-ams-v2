import pool from './src/db/pool.js';

const t = await pool.query(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'assignments' 
  ORDER BY ordinal_position
`);
console.log('Assignments columns:', t.rows.map(r => r.column_name).join(', '));
process.exit();