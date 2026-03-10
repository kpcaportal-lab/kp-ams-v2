import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased to 10s for slower connections
});
pool.on('error', (err) => {
    console.error('Unexpected DB error:', err);
});
// Test database connection
(async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connection successful');
    }
    catch (err) {
        console.error('Database connection failed:', err);
    }
})();
export default pool;
