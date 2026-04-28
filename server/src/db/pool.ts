import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000,
});

pool.on('connect', () => {
    // Optional: Log on connect if needed
});

pool.on('error', (err: Error) => {
    console.error('CRITICAL: Unexpected DB error:', err.message);
});

// Test database connection immediately
(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Database connected at:', res.rows[0].now);
    } catch (err: any) {
        console.error('❌ Database connection FAILED:', err.message);
        if (err.stack) console.error(err.stack);
    }
})();

export default pool;
