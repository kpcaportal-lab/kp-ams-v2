import pool from './src/db/pool.js';

async function listUsers() {
    try {
        const res = await pool.query("SELECT id, email, role, full_name FROM profiles");
        console.log('Total Users:', res.rows.length);
        console.log(res.rows);
    } catch (err) {
        console.error('Error listing users:', err);
    } finally {
        process.exit();
    }
}

listUsers();
