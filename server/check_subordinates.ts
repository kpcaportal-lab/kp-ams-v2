import pool from './src/db/pool.js';

async function checkSubordinates() {
    const hamzaId = '00000000-0000-0000-0000-000000000012';
    try {
        const res = await pool.query(
            "SELECT id, full_name, role FROM profiles WHERE reports_to = $1",
            [hamzaId]
        );
        console.log('Hamza Subordinates:', res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkSubordinates();
