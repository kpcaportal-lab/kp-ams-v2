import pool from './src/db/pool.js';

async function checkAssignmentBilledAmount() {
    const hamzaId = '00000000-0000-0000-0000-000000000012';
    try {
        const res = await pool.query(
            "SELECT id, total_fees, billed_amount FROM assignments WHERE manager_id = $1",
            [hamzaId]
        );
        console.log('Hamza Assignments Billed Amounts:', res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkAssignmentBilledAmount();
