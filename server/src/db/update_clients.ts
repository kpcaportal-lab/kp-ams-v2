import pool from './pool.js';
import { v4 as uuidv4 } from 'uuid';

const newClients = [
    'Mah Logistics Ltd',
    'Mah Accelo Ltd',
    'Bristlecone India Ltd',
    'Mah Auto Steel Pvt Ltd',
    'Mah Steel Service Center Ltd',
    'Mahindra MSTC Recycling Pvt. Ltd',
    'LORDS Freight (India) Private Limited',
    'MLL Express Services Private Limited',
    'MLL Mobility Pvt. Ltd'
];

async function updateClients() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('🧹 Clearing all existing clients and their related proposals/assignments using TRUNCATE CASCADE...');
        // TRUNCATE with CASCADE will safely delete all dependent records without needing to know every table name
        await client.query('TRUNCATE TABLE clients CASCADE');
        
        console.log('🌱 Seeding new Mahindra clients...');
        for (const name of newClients) {
            await client.query(
                'INSERT INTO clients (id, name, status, industry) VALUES ($1, $2, $3, $4)',
                [uuidv4(), name, 'active', 'Logistics/Manufacturing']
            );
        }
        
        await client.query('COMMIT');
        console.log('✅ Data reset and clients updated successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to update clients:', err);
    } finally {
        client.release();
        process.exit();
    }
}

updateClients();
