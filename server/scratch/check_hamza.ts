import pool from '../src/db/pool.ts';

async function checkHamza() {
    try {
        const res = await pool.query("SELECT id, email, full_name, role FROM profiles WHERE full_name ILIKE '%Hamza%' OR email ILIKE '%hamza%'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkHamza();
