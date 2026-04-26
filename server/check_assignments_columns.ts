import pool from './src/db/pool.js';

async function checkColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'assignments'
        `);
        console.log('Columns in assignments table:');
        console.log(res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        process.exit();
    }
}

checkColumns();
