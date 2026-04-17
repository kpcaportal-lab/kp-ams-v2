import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
    console.log('🔧 Running database migrations...');
    try {
        const migrationsDir = path.join(__dirname, '../../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`📂 Found ${files.length} migration files`);

        for (const file of files) {
            console.log(`🔧 Executing migration: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            try {
                await pool.query(sql);
                console.log(`✅ ${file} complete`);
            } catch (err: any) {
                console.error(`❌ Error in ${file}:`, err.message);
                // Continue if it's a "already exists" error, otherwise throw
                if (err.message.includes('already exists') || err.message.includes('already a member')) {
                   console.log(`⚠️  Skipping non-critical error in ${file}`);
                } else {
                    throw err;
                }
            }
        }
        console.log('🚀 All migrations finished successfully');
    } catch (err: any) {
        console.error('❌ Migration failed:', err.message);
        if (err.stack) console.error(err.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
