import pool from './src/db/pool.js';

async function checkHamza() {
    try {
        const hamza = await pool.query("SELECT id, email, full_name FROM profiles WHERE full_name = 'Hamza Momin' OR email = 'hamza.momin@kpis.co.in'");
        if (hamza.rows.length === 0) {
            console.log("Hamza Momin not found");
            return;
        }
        const hamzaId = hamza.rows[0].id;
        console.log(`Found Hamza Momin with ID: ${hamzaId}`);

        const assignments = await pool.query(`
            SELECT a.id, c.name as client_name, a.fiscal_year, a.category
            FROM assignments a
            JOIN clients c ON a.client_id = c.id
            WHERE a.manager_id = $1
        `, [hamzaId]);

        console.log(`Hamza has ${assignments.rows.length} assignments:`);
        assignments.rows.forEach(row => {
            console.log(`- ${row.client_name} (${row.fiscal_year}, Category ${row.category})`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkHamza();
