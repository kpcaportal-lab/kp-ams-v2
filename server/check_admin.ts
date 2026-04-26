import pool from './src/db/pool.js';

async function checkAdmin() {
    try {
        const res = await pool.query("SELECT id, email, role, full_name FROM profiles WHERE email = 'admin@gmail.com'");
        console.log('Admin User:');
        console.log(res.rows[0]);
    } catch (err) {
        console.error('Error checking admin:', err);
    } finally {
        process.exit();
    }
}

checkAdmin();
