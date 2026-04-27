import pool from './src/db/pool.js';

async function checkHamzaAssignments() {
    const hamzaId = '00000000-0000-0000-0000-000000000012';
    try {
        const res = await pool.query(
            "SELECT COUNT(*) FROM assignments WHERE manager_id = $1 OR partner_id = $1",
            [hamzaId]
        );
        console.log('Hamza Assignments Count:', res.rows[0].count);

        const res2 = await pool.query(
            "SELECT COUNT(*) FROM assignments WHERE partner_id = $1",
            [hamzaId]
        );
        console.log('As Partner:', res2.rows[0].count);

        const res3 = await pool.query(
            "SELECT COUNT(*) FROM assignments WHERE manager_id = $1",
            [hamzaId]
        );
        console.log('As Manager:', res3.rows[0].count);
        
        const fiscal = await pool.query("SELECT DISTINCT fiscal_year FROM assignments");
        console.log('Available Fiscal Years:', fiscal.rows.map(r => r.fiscal_year));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkHamzaAssignments();
