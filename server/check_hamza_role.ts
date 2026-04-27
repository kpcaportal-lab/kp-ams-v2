import pool from './src/db/pool.js';

async function checkHamza() {
    try {
        const res = await pool.query("SELECT id, full_name, role, is_active FROM profiles WHERE full_name ILIKE '%Hamza%'");
        console.log('Hamza User:', res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkHamza();
