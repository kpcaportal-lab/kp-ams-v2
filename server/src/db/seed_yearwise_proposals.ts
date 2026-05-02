import pool from './pool.js';
import { v4 as uuidv4 } from 'uuid';

async function seedYearWiseProposals() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('🧹 Cleaning up existing proposals...');
        await client.query('DELETE FROM proposals');
        await client.query('DELETE FROM proposal_sequences');

        console.log('🚀 Adding index to fiscal_year in proposals...');
        await client.query('CREATE INDEX IF NOT EXISTS idx_proposals_fiscal_year ON proposals(fiscal_year)');

        console.log('🔍 Checking for clients...');
        const clientCheck = await client.query('SELECT id, name FROM clients LIMIT 5');
        let clients = clientCheck.rows;

        if (clients.length === 0) {
            console.log('🌱 No clients found, seeding sample clients...');
            const newClients = [
                { name: 'Tata Motors Ltd', industry: 'Automotive' },
                { name: 'Reliance Industries', industry: 'Energy' },
                { name: 'HDFC Bank', industry: 'Banking' },
                { name: 'Infosys Ltd', industry: 'IT' },
                { name: 'Mahindra & Mahindra', industry: 'Automotive' }
            ];
            for (const c of newClients) {
                const res = await client.query(
                    'INSERT INTO clients (id, name, industry, status) VALUES ($1, $2, $3, \'active\') RETURNING id, name',
                    [uuidv4(), c.name, c.industry]
                );
                clients.push(res.rows[0]);
            }
        }

        console.log('🔍 Checking for profiles...');
        const profileCheck = await client.query('SELECT id, role FROM profiles WHERE role IN (\'admin\', \'partner\') LIMIT 5');
        if (profileCheck.rows.length === 0) {
            throw new Error('No admin or partner profiles found. Please run the server first to sync users.');
        }

        const admin = profileCheck.rows.find(r => r.role === 'admin') || profileCheck.rows[0];
        const partner = profileCheck.rows.find(r => r.role === 'partner') || profileCheck.rows[0];

        const adminId = admin.id;
        const partnerId = partner.id;

        console.log(`Using Admin ID: ${adminId}, Partner ID: ${partnerId}`);

        const years = ['2024-25', '2025-26', '2026-27'];
        
        // Target: 2025-26 (Last Year) - Won Portfolio ~1.35 Cr
        // Target: 2026-27 (Current Year) - Growth to ~2.10 Cr
        
        const proposalData = [
            // 2024-25
            { year: '2024-25', count: 8, totalValue: 8000000, wonValue: 3500000, status: 'won' },
            { year: '2024-25', count: 4, totalValue: 4000000, wonValue: 0, status: 'lost' },
            
            // 2025-26 (The 1.35 Cr target year)
            { year: '2025-26', count: 12, totalValue: 13500000, wonValue: 13500000, status: 'won' },
            { year: '2025-26', count: 5, totalValue: 5000000, wonValue: 0, status: 'lost' },
            { year: '2025-26', count: 3, totalValue: 3000000, wonValue: 0, status: 'pending' },

            // 2026-27 (Current/Future year)
            { year: '2026-27', count: 18, totalValue: 21000000, wonValue: 21000000, status: 'won' },
            { year: '2026-27', count: 6, totalValue: 7500000, wonValue: 0, status: 'lost' },
            { year: '2026-27', count: 10, totalValue: 15000000, wonValue: 0, status: 'pending' }
        ];

        console.log('🌱 Seeding proposals for multiple years...');
        const yearSequences: Record<string, number> = {};

        for (const data of proposalData) {
            if (!yearSequences[data.year]) yearSequences[data.year] = 1;
            console.log(`  Processing ${data.year} (${data.status})...`);
            
            for (let i = 0; i < data.count; i++) {
                const randomClient = clients[Math.floor(Math.random() * clients.length)];
                const amount = Math.floor(data.totalValue / data.count);
                const seq = yearSequences[data.year]++;
                const number = `KP/GEN/${data.year}/${seq.toString().padStart(3, '0')}`;
                
                await client.query(`
                    INSERT INTO proposals (
                        id, number, client_id, proposal_type, assignment_type, 
                        quotation_amount, revised_fee, status, fiscal_year, 
                        prepared_by, responsible_partner, proposal_date, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                `, [
                    uuidv4(),
                    number,
                    randomClient.id,
                    'new',
                    'internal_audit',
                    amount,
                    data.status === 'won' ? amount : null,
                    data.status,
                    data.year,
                    adminId,
                    partnerId,
                    new Date(data.year.split('-')[0] + '-04-01'),
                    new Date(data.year.split('-')[0] + '-04-01')
                ]);
            }
        }

        await client.query('COMMIT');
        console.log('✅ Seeding completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

seedYearWiseProposals();
