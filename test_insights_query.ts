import pool from './server/src/db/pool.js';

async function testQuery() {
  const period = '2025-26';
  const query = `
                SELECT 
                    p.id, p.full_name, p.display_name, p.role, p.email,
                    (SELECT COUNT(DISTINCT a.client_id) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as client_count,
                    (SELECT COUNT(*) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as assignment_count,
                    (SELECT COUNT(*) FROM proposals pr WHERE pr.prepared_by = p.id AND pr.fiscal_year = $1) as proposal_count,
                    (
                        SELECT COALESCE(SUM(i.professional_fees), 0) 
                        FROM invoices i 
                        JOIN assignments a ON i.assignment_id = a.id 
                        WHERE a.manager_id = p.id AND a.fiscal_year = $1
                    ) as billed_amount
                FROM profiles p
                WHERE p.role IN ('manager', 'assistant_manager', 'partner', 'director') 
                  AND p.is_active = true
                  AND (
                    EXISTS (SELECT 1 FROM assignments a WHERE a.manager_id = p.id OR a.partner_id = p.id)
                    OR EXISTS (SELECT 1 FROM proposals pr WHERE pr.prepared_by = p.id OR pr.responsible_partner = p.id)
                    OR p.id IN ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005')
                )
            `;
  try {
    const res = await pool.query(query, [period]);
    console.log('Query Result:');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Query Error:', err);
  } finally {
    await pool.end();
  }
}

testQuery();
