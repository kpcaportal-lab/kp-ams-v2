
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
    const assignments = await client.query("SELECT count(*) FROM assignments");
    const invoices = await client.query("SELECT count(*) FROM invoices");
    console.log({ assignments: assignments.rows[0].count, invoices: invoices.rows[0].count });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
