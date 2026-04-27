import pool from './src/db/pool.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(process.cwd(), 'server/migrations/022_add_assessment_year.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration 022 successful');
    } catch (e) {
        console.error('Migration 022 failed:', e);
    } finally {
        process.exit();
    }
}

runMigration();
