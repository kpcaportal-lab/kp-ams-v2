
import { pool } from './pool';

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, full_name, role FROM users');
    console.log('Current Users:');
    console.table(result.rows);
  } catch (err) {
    console.error('Error checking users:', err);
  } finally {
    await pool.end();
  }
}

checkUsers();
