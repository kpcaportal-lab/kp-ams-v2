import pool from './src/db/pool.js';

async function listTables() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:');
        console.log(res.rows.map(x => x.table_name).join(', '));
    } catch (err) {
        console.error('Error listing tables:', err);
    } finally {
        process.exit();
    }
}

listTables();
