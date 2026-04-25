
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAllTables() {
    try {
        const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log("Tables in public schema:");
        for (const row of res.rows) {
            const tableName = row.table_name;
            const columns = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [tableName]);
            console.log(`\nTable: ${tableName}`);
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type})`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAllTables();
