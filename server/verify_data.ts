import pool from './src/db/pool.js';

async function check() {
  try {
    const hamzaRes = await pool.query("SELECT id, full_name, role FROM profiles WHERE full_name ILIKE '%Hamza%'");
    console.log('Hamza Profiles:', hamzaRes.rows);

    const assignmentCount = await pool.query("SELECT count(*) FROM assignments WHERE fiscal_year = '2025-26'");
    console.log('Total Assignments (2025-26):', assignmentCount.rows[0].count);

    const invoiceCount = await pool.query("SELECT count(*) FROM invoices i JOIN assignments a ON a.id = i.assignment_id WHERE a.fiscal_year = '2025-26'");
    console.log('Total Invoices (2025-26):', invoiceCount.rows[0].count);

    const billedSum = await pool.query("SELECT SUM(professional_fees) FROM invoices i JOIN assignments a ON a.id = i.assignment_id WHERE a.fiscal_year = '2025-26'");
    console.log('Total Billed (2025-26):', billedSum.rows[0].sum);

    const hamzaAssignments = await pool.query("SELECT count(*) FROM assignments WHERE manager_id = '00000000-0000-0000-0000-000000000012'");
    console.log('Hamza Assignments Count:', hamzaAssignments.rows[0].count);

  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
