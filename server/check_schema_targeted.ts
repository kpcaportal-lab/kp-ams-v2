
import pool from './src/db/pool.js';

async function checkSchema() {
    try {
        const tables = ['clients', 'proposals'];
        for (const table of tables) {
            console.log(`--- Schema for ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY column_name
            `, [table]);
            res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
