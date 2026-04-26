import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const { rows: assignments } = await pool.query(`
      SELECT 
        SUM(total_fees) as total_gross_fees, 
        SUM(billed_amount) as total_billed
      FROM assignments
    `);

    const { rows: proposals } = await pool.query(`
      SELECT 
        SUM(quotation_amount) as total_won_proposals
      FROM proposals 
      WHERE status = 'won'
    `);

    const { rows: totalProposals } = await pool.query(`
      SELECT SUM(quotation_amount) as total_pipeline FROM proposals
    `);

    console.log('--- Financial Overview of the Portal ---');
    console.log(`Total Gross Estimated Fees (All Assignments): ₹${Number(assignments[0].total_gross_fees).toLocaleString('en-IN')}`);
    console.log(`Total Billed Amount (Invoiced): ₹${Number(assignments[0].total_billed).toLocaleString('en-IN')}`);
    console.log(`Total Value of Won Proposals: ₹${Number(proposals[0].total_won_proposals).toLocaleString('en-IN')}`);
    console.log(`Total Pipeline Value (All Proposals): ₹${Number(totalProposals[0].total_pipeline).toLocaleString('en-IN')}`);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
