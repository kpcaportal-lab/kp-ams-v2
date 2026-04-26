import pool from './src/db/pool.js';

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, full_name, email, role FROM profiles');
        console.log('Users in database:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        process.exit();
    }
}

checkUsers();
