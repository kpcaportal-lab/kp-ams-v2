import pool from './src/db/pool.js';

async function main() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'assignments'");
    console.log(res.rows.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
main();
