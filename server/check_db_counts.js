
import pool from './dist/db/pool.js';

async function checkCounts() {
    try {
        const tables = ['profiles', 'clients', 'proposals', 'assignments', 'invoices', 'tickets', 'notifications'];
        for (const table of tables) {
            const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`${table}: ${res.rows[0].count}`);
        }
    } catch (err) {
        console.error('Error checking counts:', err);
    } finally {
        process.exit();
    }
}

checkCounts();
