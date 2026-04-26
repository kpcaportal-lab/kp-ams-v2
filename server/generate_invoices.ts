import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

const MANAGER_ID = '00000000-0000-0000-0000-000000000012'; // Hamza Momin

async function main() {
  try {
    await pool.query('BEGIN');

    // Get all assignments for Hamza
    const { rows: assignments } = await pool.query(
      `SELECT id, total_fees, billed_amount, amount_receipt FROM assignments WHERE manager_id = $1`,
      [MANAGER_ID]
    );

    for (const a of assignments) {
      const assignmentId = a.id;
      const totalFees = Number(a.total_fees || 0);
      const billedAmount = Number(a.billed_amount || 0);

      // 1. Create fee allocation for the full total_fees amount (to show up in charts)
      if (totalFees > 0) {
        // Check if allocation already exists
        const { rows: existingAlloc } = await pool.query(`SELECT id FROM fee_allocations WHERE assignment_id = $1`, [assignmentId]);
        if (existingAlloc.length === 0) {
          await pool.query(`
            INSERT INTO fee_allocations (assignment_id, month, fiscal_year, amount, billed_amount)
            VALUES ($1, 4, '2025-26', $2, $3)
          `, [assignmentId, totalFees, billedAmount]);
        }
      }

      // 2. Create invoice for the billed_amount
      if (billedAmount > 0) {
        // Check if invoice already exists
        const { rows: existingInvoice } = await pool.query(`SELECT id FROM invoices WHERE assignment_id = $1`, [assignmentId]);
        if (existingInvoice.length === 0) {
          await pool.query(`
            INSERT INTO invoices (
              assignment_id, invoice_date, narration, professional_fees, out_of_pocket, net_amount, generated_by
            ) VALUES (
              $1, NOW(), 'Professional Fees for Audit Services', $2, 0, $2, '00000000-0000-0000-0000-000000000001'
            )
          `, [assignmentId, billedAmount]);
        }
      }
    }

    await pool.query('COMMIT');
    console.log(`Successfully generated fee allocations and invoices for ${assignments.length} assignments.`);
    process.exit(0);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    process.exit(1);
  }
}

main();
