import pool from './src/db/pool.ts';

async function cleanupClients() {
    try {
        const clientNames = [
            '%Apex Infra%',
            '%Zenith%',
            '%Nova%',
            '%Sterling%',
            '%Meridian%'
        ];

        console.log('Starting cleanup for clients:', clientNames);

        // Get all matching client IDs
        const clientsResult = await pool.query(`
            SELECT id, name FROM clients 
            WHERE name ILIKE ANY($1)
        `, [clientNames]);

        const clients = clientsResult.rows;
        if (clients.length === 0) {
            console.log('No matching clients found.');
            return;
        }

        const clientIds = clients.map(c => c.id);
        console.log(`Found ${clients.length} clients:`, clients.map(c => c.name));

        const runQuery = async (name: string, sql: string, params: any[]) => {
            try {
                await pool.query(sql, params);
                console.log(`Deleted ${name}.`);
            } catch (err: any) {
                if (err.code === '42P01') {
                    console.log(`Table ${name} does not exist, skipping.`);
                } else {
                    console.error(`Error deleting ${name}:`, err.message);
                }
            }
        };

        // 1. Delete email logs
        await runQuery('email_logs', `
            DELETE FROM email_logs 
            WHERE invoice_id IN (
                SELECT id FROM invoices 
                WHERE assignment_id IN (
                    SELECT id FROM assignments WHERE client_id = ANY($1)
                )
            )
        `, [clientIds]);

        // 2. Delete invoices
        await runQuery('invoices', `
            DELETE FROM invoices 
            WHERE assignment_id IN (
                SELECT id FROM assignments WHERE client_id = ANY($1)
            )
        `, [clientIds]);

        // 3. Delete fee allocations
        await runQuery('fee_allocations', `
            DELETE FROM fee_allocations 
            WHERE assignment_id IN (
                SELECT id FROM assignments WHERE client_id = ANY($1)
            )
        `, [clientIds]);

        // 4. Delete fee adjustments
        await runQuery('fee_adjustments', `
            DELETE FROM fee_adjustments 
            WHERE assignment_id IN (
                SELECT id FROM assignments WHERE client_id = ANY($1)
            )
        `, [clientIds]);

        // 5. Delete change history for assignments
        await runQuery('change_history (assignments)', `
            DELETE FROM change_history 
            WHERE entity_type = 'assignment' AND entity_id IN (
                SELECT id FROM assignments WHERE client_id = ANY($1)
            )
        `, [clientIds]);

        // 6. Delete assignments
        await runQuery('assignments', `
            DELETE FROM assignments 
            WHERE client_id = ANY($1)
        `, [clientIds]);

        // 7. Delete proposal versions
        await runQuery('proposal_versions', `
            DELETE FROM proposal_versions 
            WHERE proposal_id IN (
                SELECT id FROM proposals WHERE client_id = ANY($1)
            )
        `, [clientIds]);

        // 8. Delete change history for proposals
        await runQuery('change_history (proposals)', `
            DELETE FROM change_history 
            WHERE entity_type = 'proposal' AND entity_id IN (
                SELECT id FROM proposals WHERE client_id = ANY($1)
            )
        `, [clientIds]);

        // 9. Delete proposals
        await runQuery('proposals', `
            DELETE FROM proposals 
            WHERE client_id = ANY($1)
        `, [clientIds]);

        // 10. Delete client SPOCs
        await runQuery('client_spocs', `
            DELETE FROM client_spocs 
            WHERE client_id = ANY($1)
        `, [clientIds]);

        // 11. Delete change history for clients
        await runQuery('change_history (clients)', `
            DELETE FROM change_history 
            WHERE entity_type = 'client' AND entity_id = ANY($1)
        `, [clientIds]);

        // 12. Delete clients
        await runQuery('clients', `
            DELETE FROM clients 
            WHERE id = ANY($1)
        `, [clientIds]);

        console.log('Cleanup completed.');

    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        await pool.end();
    }
}

cleanupClients();
