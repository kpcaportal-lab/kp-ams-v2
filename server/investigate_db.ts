
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: 'postgresql://postgres:thedeveloper%40321@[2a05:d018:135e:16b2:ca04:db78:161b:a2ff]:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    try {
        const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'');
        console.log('Tables:', res.rows.map(r => r.tablename));
        
        const profiles = await pool.query('SELECT id, email FROM profiles LIMIT 20');
        console.log('Profiles:', profiles.rows);
        
        const assignments = await pool.query('SELECT count(*) FROM assignments');
        console.log('Assignments count:', assignments.rows[0].count);
        
    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await pool.end();
    }
}

run();
