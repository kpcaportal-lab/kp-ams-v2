import pool from './src/db/pool.js';

async function checkHamzaEmail() {
    try {
        const res = await pool.query(
            "SELECT id, full_name, email, role FROM profiles WHERE full_name ILIKE '%Hamza%'"
        );
        console.log('Hamza Profile:', res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkHamzaEmail();
