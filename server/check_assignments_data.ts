import pool from './src/db/pool.js';

async function checkAssignments() {
    try {
        const res = await pool.query(`
            SELECT a.id, c.name as client, a.manager_id, a.partner_id, a.total_fees
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
        `);
        console.log('Assignments in database:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking assignments:', err);
    } finally {
        process.exit();
    }
}

checkAssignments();
