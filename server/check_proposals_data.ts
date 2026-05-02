
import pool from './src/db/pool.js';

async function checkProposals() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM proposals');
        console.log('Total Proposals:', res.rows[0].count);
        
        const sample = await pool.query('SELECT * FROM proposals LIMIT 5');
        console.log('Sample Proposals:', sample.rows);
    } catch (err) {
        console.error('Error checking proposals:', err);
    } finally {
        process.exit();
    }
}

checkProposals();
