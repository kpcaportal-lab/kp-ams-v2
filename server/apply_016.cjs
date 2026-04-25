const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync(path.join(__dirname, 'migrations', '016_purge_users_and_standardize.sql'), 'utf-8');

client.connect()
    .then(() => {
        console.log('Connected to DB, executing 016 migration...');
        return client.query(sql);
    })
    .then(() => {
        console.log('Migration 016 applied successfully to production database!');
        return client.end();
    })
    .catch(err => {
        console.error('Error applying migration:', err);
        client.end();
    });
