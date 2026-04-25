
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAllEnums() {
    try {
        const res = await pool.query(`
            SELECT t.typname as enum_name, e.enumlabel as enum_value
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            ORDER BY enum_name, e.enumsortorder
        `);
        console.log("All Public Enums:");
        let currentEnum = "";
        res.rows.forEach(row => {
            if (row.enum_name !== currentEnum) {
                console.log(`\nEnum: ${row.enum_name}`);
                currentEnum = row.enum_name;
            }
            console.log(`  - ${row.enum_value}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAllEnums();
