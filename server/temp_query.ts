import pool from './src/db/pool';

async function getUsers() {
    try {
        const res = await pool.query('SELECT id, email, role FROM users LIMIT 20');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

getUsers();
