import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function fixData() {
  try {
    await pool.query('BEGIN');

    // Update Proposals
    await pool.query(`UPDATE proposals SET client_id = '10000000-0000-0000-0000-000000000001', prepared_by = '00000000-0000-0000-0000-000000000008', responsible_partner = '00000000-0000-0000-0000-000000000002' WHERE id = '20000000-0000-0000-0000-000000000001'`);
    await pool.query(`UPDATE proposals SET client_id = '10000000-0000-0000-0000-000000000002', prepared_by = '00000000-0000-0000-0000-000000000009', responsible_partner = '00000000-0000-0000-0000-000000000002' WHERE id = '20000000-0000-0000-0000-000000000002'`);
    await pool.query(`UPDATE proposals SET client_id = '10000000-0000-0000-0000-000000000003', prepared_by = '00000000-0000-0000-0000-000000000010', responsible_partner = '00000000-0000-0000-0000-000000000003' WHERE id = '20000000-0000-0000-0000-000000000003'`);
    await pool.query(`UPDATE proposals SET client_id = '10000000-0000-0000-0000-000000000004', prepared_by = '00000000-0000-0000-0000-000000000011', responsible_partner = '00000000-0000-0000-0000-000000000003' WHERE id = '20000000-0000-0000-0000-000000000004'`);
    await pool.query(`UPDATE proposals SET client_id = '10000000-0000-0000-0000-000000000005', prepared_by = '00000000-0000-0000-0000-000000000012', responsible_partner = '00000000-0000-0000-0000-000000000005' WHERE id = '20000000-0000-0000-0000-000000000005'`);

    // Update Assignments
    await pool.query(`UPDATE assignments SET client_id = '10000000-0000-0000-0000-000000000001', manager_id = '00000000-0000-0000-0000-000000000008', partner_id = '00000000-0000-0000-0000-000000000002' WHERE id = '30000000-0000-0000-0000-000000000001'`);
    await pool.query(`UPDATE assignments SET client_id = '10000000-0000-0000-0000-000000000002', manager_id = '00000000-0000-0000-0000-000000000009', partner_id = '00000000-0000-0000-0000-000000000002' WHERE id = '30000000-0000-0000-0000-000000000002'`);
    await pool.query(`UPDATE assignments SET client_id = '10000000-0000-0000-0000-000000000003', manager_id = '00000000-0000-0000-0000-000000000010', partner_id = '00000000-0000-0000-0000-000000000003' WHERE id = '30000000-0000-0000-0000-000000000003'`);
    await pool.query(`UPDATE assignments SET client_id = '10000000-0000-0000-0000-000000000004', manager_id = '00000000-0000-0000-0000-000000000011', partner_id = '00000000-0000-0000-0000-000000000003' WHERE id = '30000000-0000-0000-0000-000000000004'`);
    await pool.query(`UPDATE assignments SET client_id = '10000000-0000-0000-0000-000000000005', manager_id = '00000000-0000-0000-0000-000000000012', partner_id = '00000000-0000-0000-0000-000000000005' WHERE id = '30000000-0000-0000-0000-000000000005'`);

    // Assign Dhanashree (13) to Zenith as well
    await pool.query(`
      INSERT INTO assignments (id, proposal_id, client_id, gstn, category, total_fees, billing_cycle, partner_id, manager_id, status, start_date, fiscal_year, assessment_year, scope_areas, billed_amount, amount_receipt, created_by)
      VALUES (
        '30000000-0000-0000-0000-000000000006', 
        '20000000-0000-0000-0000-000000000005', 
        '10000000-0000-0000-0000-000000000005', 
        '06AABCZ7890E5Z6',
        'B', 
        600000, 
        'quarterly', 
        '00000000-0000-0000-0000-000000000005', 
        '00000000-0000-0000-0000-000000000013', 
        'active', 
        '2025-06-15', 
        '2025-26', 
        '2025-26',
        'Inventory Audit', 
        200000, 
        150000, 
        '00000000-0000-0000-0000-000000000001'
      ) ON CONFLICT (id) DO UPDATE SET partner_id = EXCLUDED.partner_id, manager_id = EXCLUDED.manager_id
    `);

    // Add some Fee Allocations for assignment 6
    await pool.query(`INSERT INTO fee_allocations (assignment_id, month, fiscal_year, amount, billed_amount) VALUES ('30000000-0000-0000-0000-000000000006', 4, '2025-26', 150000, 150000) ON CONFLICT DO NOTHING`);

    await pool.query('COMMIT');
    console.log('Successfully realigned clients, proposals, and assignments.');
    process.exit(0);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    process.exit(1);
  }
}

fixData();
