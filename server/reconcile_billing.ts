import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('🔄 Starting billing reconciliation...');

  try {
    // 1. Get all assignments and the sum of their invoices
    const { rows } = await pool.query(`
      SELECT 
        a.id, 
        a.scope_item, 
        a.billed_amount as current_billed,
        COALESCE(SUM(i.professional_fees), 0) as actual_sum
      FROM assignments a
      LEFT JOIN invoices i ON i.assignment_id = a.id
      GROUP BY a.id, a.scope_item, a.billed_amount
    `);

    let updatedCount = 0;
    for (const row of rows) {
      const current = Number(row.current_billed || 0);
      const actual = Number(row.actual_sum || 0);

      if (current !== actual) {
        console.log(`📍 Reconciling assignment: ${row.scope_item} (${row.id})`);
        console.log(`   - Current: ${current}, Actual: ${actual}`);
        
        await pool.query(
          "UPDATE assignments SET billed_amount = $1, updated_at = NOW() WHERE id = $2",
          [actual, row.id]
        );
        updatedCount++;
      }
    }

    console.log(`✅ Reconciliation complete. Updated ${updatedCount} assignments.`);

  } catch (err) {
    console.error('❌ Error during reconciliation:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
