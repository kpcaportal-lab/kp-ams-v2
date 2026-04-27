import pool from './src/db/pool.js';
import { getVisibleUserIds } from './src/middleware/auth.js';

async function testVisibility() {
    const hamzaUser = {
        id: '00000000-0000-0000-0000-000000000012',
        email: 'hamza.momin@kpis.co.in',
        role: 'manager',
        full_name: 'Hamza Momin'
    };

    try {
        const visibleIds = await getVisibleUserIds(hamzaUser as any);
        console.log('Visible IDs for Hamza:', visibleIds);

        const res = await pool.query(
            `SELECT COUNT(*) FROM assignments 
             WHERE manager_id = ANY($1) OR partner_id = ANY($1) OR created_by = ANY($1)`,
            [visibleIds]
        );
        console.log('Assignments visible to Hamza:', res.rows[0].count);

        const res2 = await pool.query(
            `SELECT SUM(billed_amount) FROM assignments 
             WHERE manager_id = ANY($1) OR partner_id = ANY($1) OR created_by = ANY($1)`,
            [visibleIds]
        );
        console.log('Total Billed visible to Hamza:', res2.rows[0].sum);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testVisibility();
