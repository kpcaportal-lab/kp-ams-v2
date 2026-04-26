import pool from './src/db/pool.js';

async function checkAssignments() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'assignments'");
        console.log('Assignments columns:');
        console.log(res.rows.map(x => x.column_name).join(', '));
    } catch (err) {
        console.error('Error checking assignments:', err);
    } finally {
        process.exit();
    }
}

checkAssignments();
