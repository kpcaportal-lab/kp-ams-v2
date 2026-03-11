import pool from './src/db/pool.js';

async function getUsers() {
    try {
        const res = await pool.query('SELECT id, email, role, is_active FROM profiles LIMIT 20');
        console.log("JSON_OUTPUT_START");
        console.log(JSON.stringify(res.rows, null, 2));
        console.log("JSON_OUTPUT_END");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

getUsers();
