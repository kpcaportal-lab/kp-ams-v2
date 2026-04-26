import pool from './src/db/pool.js';

async function checkInvoices() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices'");
        console.log('Invoices columns:');
        console.log(res.rows.map(x => x.column_name).join(', '));
    } catch (err) {
        console.error('Error checking invoices:', err);
    } finally {
        process.exit();
    }
}

checkInvoices();
