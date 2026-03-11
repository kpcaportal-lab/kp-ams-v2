import pool from './src/db/pool.js';

async function getUsers() {
    try {
        const res = await pool.query('SELECT id, email, role, is_active FROM profiles LIMIT 20');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

getUsers();
