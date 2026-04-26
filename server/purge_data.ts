import pool from './src/db/pool.js';

async function purgeSeedData() {
    try {
        console.log('Starting data purge...');
        await pool.query('BEGIN');

        // 1. Identify users to keep
        const keepEmails = [
            'admin.kpams@gmail.com',
            'milind.limaye@kirtanepandit.com',
            'tanmay.bodhe@kirtanepandit.com',
            'rishabh.thakkar@kirtanepandit.com',
            'hamza.momin@kirtanepandit.com'
        ];

        // 2. Delete all assignments, invoices, fee_allocations, proposals, tickets, notifications
        // We start with child tables
        await pool.query('DELETE FROM notifications');
        await pool.query('DELETE FROM tickets');
        await pool.query('DELETE FROM fee_allocations');
        await pool.query('DELETE FROM invoices');
        await pool.query('DELETE FROM assignments');
        await pool.query('DELETE FROM proposals');
        await pool.query('DELETE FROM clients');
        console.log('✅ All seed data (assignments, invoices, etc.) purged');

        // 3. Delete unauthorized users
        const keepEmailsList = keepEmails.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(`
            DELETE FROM profiles 
            WHERE email NOT IN (${keepEmailsList})
        `, keepEmails);
        console.log('✅ Unauthorized users purged');

        await pool.query('COMMIT');
        console.log('Purge complete.');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Purge failed:', err);
    } finally {
        process.exit();
    }
}

purgeSeedData();
