import pool from './src/db/pool.js';

async function testDashboardQuery() {
    const hamzaId = '00000000-0000-0000-0000-000000000012';
    const fiscal_year = '2025-26';
    const visibleIds = [hamzaId];

    try {
        let totalBilledQuery = `
            SELECT COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as total
            FROM invoices i
            JOIN assignments a ON a.id = i.assignment_id
            WHERE a.fiscal_year=$1`;
        const totalBilledParams: any[] = [fiscal_year];

        if (visibleIds !== null) {
            totalBilledParams.push(visibleIds);
            totalBilledQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
        }

        console.log('Running Query:', totalBilledQuery);
        console.log('With Params:', totalBilledParams);

        const res = await pool.query(totalBilledQuery, totalBilledParams);
        console.log('Result:', res.rows[0]);

        // Check if there are any invoices at all
        const allInvoices = await pool.query("SELECT COUNT(*) FROM invoices");
        console.log('Total Invoices in DB:', allInvoices.rows[0].count);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

testDashboardQuery();
