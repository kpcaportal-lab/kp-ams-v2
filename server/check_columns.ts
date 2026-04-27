import pool from './src/db/pool.js';

async function checkColumns() {
    try {
        const res = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'assignments'"
        );
        console.log('Assignments Columns:', res.rows.map(r => r.column_name));
        
        const res2 = await pool.query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'proposals'"
        );
        console.log('Proposals Columns:', res2.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkColumns();
