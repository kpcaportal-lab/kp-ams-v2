import pool from './server/src/db/pool.js';

async function check() {
  try {
    const res = await pool.query('SELECT count(*), fiscal_year FROM assignments GROUP BY fiscal_year');
    console.log('Assignments by Fiscal Year:');
    console.log(JSON.stringify(res.rows, null, 2));

    const hamzaId = '00000000-0000-0000-0000-000000000012';
    const hamzaRes = await pool.query('SELECT count(*), fiscal_year FROM assignments WHERE manager_id = $1 GROUP BY fiscal_year', [hamzaId]);
    console.log('\nHamza Momin Assignments by Fiscal Year:');
    console.log(JSON.stringify(hamzaRes.rows, null, 2));

    const invoiceRes = await pool.query('SELECT count(*), a.fiscal_year FROM invoices i JOIN assignments a ON i.assignment_id = a.id GROUP BY a.fiscal_year');
    console.log('\nInvoices by Fiscal Year:');
    console.log(JSON.stringify(invoiceRes.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
