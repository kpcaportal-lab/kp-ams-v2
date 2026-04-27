import pool from './src/db/pool.js';

async function check() {
    try {
        console.log('--- PROFILES ---');
        const p = await pool.query('SELECT id, email, full_name, role, is_active FROM profiles ORDER BY full_name');
        console.table(p.rows);

        try {
            console.log('\n--- USERS (Legacy) ---');
            const u = await pool.query('SELECT id, email, full_name, role FROM users ORDER BY full_name');
            console.table(u.rows);
        } catch (e) {
            console.log('Users table does not exist or error occurred.');
        }

        console.log('\n--- ASSIGNMENTS FOR HAMZA ---');
        const hamzaId = '00000000-0000-0000-0000-000000000012';
        const a = await pool.query('SELECT count(*) FROM assignments WHERE manager_id = $1 OR partner_id = $1', [hamzaId]);
        console.log(`Total assignments for Hamza: ${a.rows[0].count}`);

        const FY = '2025-26';
        const aFY = await pool.query('SELECT count(*) FROM assignments WHERE (manager_id = $1 OR partner_id = $1) AND fiscal_year = $2', [hamzaId, FY]);
        console.log(`Assignments for Hamza in ${FY}: ${aFY.rows[0].count}`);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
        process.exit();
    }
}

check();
