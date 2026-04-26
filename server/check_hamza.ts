import pool from './src/db/pool.js';
(async () => {
    try {
        const schema = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['client_spocs']);
        console.log('Client SPOCs Table Schema:', schema.rows);
        
        const fyCheck = await pool.query('SELECT fiscal_year, COUNT(*) FROM assignments GROUP BY fiscal_year');
        console.log('Fiscal Years in Assignments:', fyCheck.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
