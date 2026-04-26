import pool from './src/db/pool.ts';

async function check() {
    try {
        const query = `
            SELECT a.id, c.name, a.total_fees, a.billed_amount, a.amount_receipt 
            FROM assignments a 
            JOIN clients c ON c.id = a.client_id 
            WHERE c.name LIKE '%Mahindra%' 
            LIMIT 5
        `;
        const r = await pool.query(query);
        console.log(JSON.stringify(r.rows, null, 2));
    } catch (e: any) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}

check();
