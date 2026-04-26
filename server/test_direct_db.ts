import pg from 'pg';
const { Pool } = pg;

const directUrl = "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres";

const pool = new Pool({
  connectionString: directUrl,
  ssl: { rejectUnauthorized: false }
});

async function testDirect() {
  try {
    console.log('Testing direct connection...');
    const res = await pool.query('SELECT 1');
    console.log('✅ Direct connection successful');
  } catch (err) {
    console.error('❌ Direct connection failed:', err);
  } finally {
    await pool.end();
  }
}

testDirect();
