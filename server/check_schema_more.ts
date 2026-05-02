
import pool from './src/db/pool.js';

async function checkSchema() {
    try {
        const tables = ['client_spocs', 'proposal_versions', 'proposal_sequences'];
        for (const table of tables) {
            console.log(`--- Schema for ${table} ---`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY column_name
            `, [table]);
            if (res.rows.length === 0) {
                console.log(`Table ${table} DOES NOT EXIST`);
            } else {
                res.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
            }
        }
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
