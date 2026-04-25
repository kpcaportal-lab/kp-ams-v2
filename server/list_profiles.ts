import pool from './src/db/pool.ts';
async function list() {
    try {
        const res = await pool.query("SELECT id, full_name, email, role FROM profiles");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
list();
