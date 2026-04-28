import pkg from 'pg';
const { Client } = pkg;

const configurations = [
    {
        name: 'Pooler Transaction Mode (6543) - US',
        connectionString: 'postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require'
    },
    {
        name: 'Pooler Session Mode (5432) - US',
        connectionString: 'postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'
    }
];

async function testConnections() {
    for (const config of configurations) {
        console.log(`\nTesting ${config.name}...`);
        const client = new Client({
            connectionString: config.connectionString,
            connectionTimeoutMillis: 10000,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log(`✅ Success! Connected to ${config.name}`);
            const res = await client.query('SELECT NOW()');
            console.log('Database time:', res.rows[0].now);
            await client.end();
        } catch (err: any) {
            console.error(`❌ Failed: ${err.message}`);
        }
    }
}

testConnections();
