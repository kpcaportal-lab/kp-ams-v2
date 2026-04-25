import pool from './src/db/pool.js';
import { getVisibleUserFilter } from './src/middleware/auth.js';

const mockUser = {
    id: '00000000-0000-0000-0000-000000000012', // Hamza Momin
    email: 'hamza@example.com',
    role: 'manager',
    full_name: 'Hamza Momin'
};

async function testAssignments() {
    try {
        const vis = await getVisibleUserFilter(mockUser, 'a.manager_id', 'a.partner_id');
        console.log('Visibility Clause:', vis.clause);
        console.log('Visibility Params:', vis.params);

        const query = `
            SELECT a.*, c.name as client_name, p.full_name as partner_name, m.full_name as manager_name
            FROM assignments a
            LEFT JOIN clients c ON a.client_id = c.id
            LEFT JOIN profiles p ON a.partner_id = p.id
            LEFT JOIN profiles m ON a.manager_id = m.id
            WHERE 1=1 ${vis.clause}
            ORDER BY a.created_at DESC
        `;
        const result = await pool.query(query, vis.params);
        console.log('Assignments found:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('First Assignment:', {
                id: result.rows[0].id,
                status: result.rows[0].status,
                client_name: result.rows[0].client_name,
                manager_id: result.rows[0].manager_id
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

testAssignments();
