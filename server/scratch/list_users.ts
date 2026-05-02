import pool from '../src/db/pool.ts';

async function listUsers() {
    try {
        const res = await pool.query('SELECT id, email, full_name, role FROM profiles ORDER BY email');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

listUsers();
