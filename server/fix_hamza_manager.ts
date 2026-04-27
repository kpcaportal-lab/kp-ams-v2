import pool from './src/db/pool.js';

const r = await pool.query(`
  UPDATE profiles 
  SET role = 'manager' 
  WHERE email = 'hamza.momin@kirtanepandit.com' 
  RETURNING *
`);
console.table(r.rows);
process.exit();