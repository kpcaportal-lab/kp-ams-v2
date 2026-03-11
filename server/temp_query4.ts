import pool from './src/db/pool.js';

async function getUsers() {
    try {
        const roles = ['admin', 'partner', 'manager', 'staff'];
        const results = [];
        for (const role of roles) {
            const res = await pool.query('SELECT email, role FROM profiles WHERE role=$1 LIMIT 1', [role]);
            if (res.rows.length > 0) results.push(res.rows[0]);
        }
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

getUsers();
