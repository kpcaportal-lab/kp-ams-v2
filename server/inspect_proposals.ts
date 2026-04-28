
import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'proposals'");
    console.log(res.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
