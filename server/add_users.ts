import pool from './src/db/pool.js';

async function addMoreUsers() {
    try {
        console.log('Adding more users...');
        const users = [
            { id: '00000000-0000-0000-0000-000000000008', full_name: 'Sanjeev Deshpande', email: 'sanjeev.deshpande@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000002' },
            { id: '00000000-0000-0000-0000-000000000009', full_name: 'Bhushan Patil', email: 'bhushan.patil@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000002' },
            { id: '00000000-0000-0000-0000-000000000010', full_name: 'Mohit Joshi', email: 'mohit.joshi@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000003' },
            { id: '00000000-0000-0000-0000-000000000011', full_name: 'Vibhuti Narang', email: 'vibhuti.narang@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000003' },
            { id: '00000000-0000-0000-0000-000000000013', full_name: 'Dhanashree Dekhane', email: 'dhanashree.dekhane@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000005' },
            { id: '00000000-0000-0000-0000-000000000014', full_name: 'Manager 7', email: 'manager7@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000001' },
            { id: '00000000-0000-0000-0000-000000000015', full_name: 'Manager 8', email: 'manager8@kirtanepandit.com', role: 'manager', reports_to: '00000000-0000-0000-0000-000000000001' },
            { id: '00000000-0000-0000-0000-000000000018', full_name: 'Staff 1', email: 'staff1@kirtanepandit.com', role: 'staff', reports_to: '00000000-0000-0000-0000-000000000012' }
        ];

        for (const u of users) {
            await pool.query(`
                INSERT INTO profiles (id, full_name, email, role, reports_to, is_active, password_hash)
                VALUES ($1, $2, $3, $4, $5, true, 'STUB')
                ON CONFLICT (id) DO UPDATE SET 
                    full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role,
                    reports_to = EXCLUDED.reports_to,
                    is_active = true
            `, [u.id, u.full_name, u.email, u.role, u.reports_to]);
        }
        console.log('✅ Users added successfully');
    } catch (err) {
        console.error('Error adding users:', err);
    } finally {
        process.exit();
    }
}

addMoreUsers();
