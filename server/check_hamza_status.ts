import pool from './src/db/pool.js';

async function checkHamzaAssignmentStatus() {
    const hamzaId = '00000000-0000-0000-0000-000000000012';
    try {
        const res = await pool.query(
            "SELECT status, COUNT(*) FROM assignments WHERE manager_id = $1 GROUP BY status",
            [hamzaId]
        );
        console.log('Hamza Assignment Statuses:', res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkHamzaAssignmentStatus();
