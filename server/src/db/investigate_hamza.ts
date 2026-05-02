import pool from './pool.js';

async function checkHamza() {
    try {
        const res = await pool.query("SELECT id, email, full_name, display_name, role, reports_to, is_active FROM profiles WHERE email ILIKE '%hamza%' OR full_name ILIKE '%hamza%'");
        console.log('Hamza Momin Profile Data:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkHamza();
