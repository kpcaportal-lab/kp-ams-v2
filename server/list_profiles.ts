import pool from './src/db/pool.js';

async function listProfiles() {
    try {
        const res = await pool.query("SELECT id, email, role, full_name, is_active FROM profiles ORDER BY email");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error listing profiles:', err);
    } finally {
        process.exit();
    }
}

listProfiles();
