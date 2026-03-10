import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function test() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Testing connection...');
        const res = await pool.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        console.log('Running Step 1 (Schema)...');
        const schemaSQL = fs.readFileSync(path.join(__dirname, '../../migrations/001_schema.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('Step 1 complete');

        console.log('Running Step 2 (Seed)...');
        const seedSQL = fs.readFileSync(path.join(__dirname, '../../migrations/002_seed.sql'), 'utf8');
        await pool.query(seedSQL);
        console.log('Step 2 complete');

    } catch (err: any) {
        console.error('ERROR:', err.message);
        if (err.detail) console.error('DETAIL:', err.detail);
        if (err.where) console.error('WHERE:', err.where);
    } finally {
        await pool.end();
    }
}

test();
