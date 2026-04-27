import pool from './src/db/pool.js';

async function checkHamzaInvoices() {
    const hamzaId = '00000000-0000-0000-0000-000000000012';
    try {
        const res = await pool.query(
            `SELECT COUNT(i.*) 
             FROM invoices i
             JOIN assignments a ON a.id = i.assignment_id
             WHERE a.manager_id = $1 OR a.partner_id = $1`,
            [hamzaId]
        );
        console.log('Invoices for Hamza Assignments:', res.rows[0].count);

        const res2 = await pool.query(
            `SELECT COALESCE(SUM(i.professional_fees), 0) as total
             FROM invoices i
             JOIN assignments a ON a.id = i.assignment_id
             WHERE a.manager_id = $1 OR a.partner_id = $1`,
            [hamzaId]
        );
        console.log('Total Prof Fees:', res2.rows[0].total);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkHamzaInvoices();
