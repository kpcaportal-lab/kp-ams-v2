import pool from './src/db/pool.js';

console.log('🔧 Fixing Hamza and seeding data...\n');

// Fix Hamza role
await pool.query(`UPDATE profiles SET role = 'manager' WHERE email = 'hamza.momin@kirtanepandit.com'`);
console.log('✅ Hamza set to manager');

// Get partner ID
const milind = await pool.query(`SELECT id FROM profiles WHERE email = 'milind.limaye@gmail.com' AND role = 'partner'`);
const partnerId = milind.rows[0]?.id;
const hamzaId = '00000000-0000-0000-0000-000000000012';

// Clear old data
await pool.query('DELETE FROM invoices');
await pool.query('DELETE FROM assignments');
await pool.query('DELETE FROM clients');

// Seed data with valid enum values and required gstn
const data = [
  { client: 'Swadhar IDWC', cat: 'A', subcat: 'forensic_investigation', fee: 250000, gstn: '27AAAAA0000A1ZR' },
  { client: 'ACG PAM Pharma Pvt Ltd', cat: 'A', subcat: 'forensic_investigation', fee: 200000, gstn: '27AABCB0892Q1ZS' },
  { client: 'ATS Nashik', cat: 'A', subcat: 'forensic_investigation', fee: 250000, gstn: '27AABCU9602Q1ZT' },
  { client: 'EOW', cat: 'A', subcat: 'forensic_investigation', fee: 200000, gstn: '27AAAAA0000A1ZR' },
  { client: 'Accent Packaging Pvt Ltd', cat: 'A', subcat: 'forensic_investigation', fee: 190000, gstn: '27AABCB0892Q1ZS' },
  { client: 'Eka Mobility Pvt Ltd', cat: 'B', subcat: 'internal_audit', fee: 800000, gstn: '27AABCE8921Q1ZT' },
  { client: 'Cooper Corporation Pvt Ltd', cat: 'B', subcat: 'internal_audit', fee: 375000, gstn: '27AABCF1234Q1ZZ' },
  { client: 'John Deere India Pvt Ltd', cat: 'B', subcat: 'internal_audit', fee: 190400, gstn: '27AABCE5678Q1ZA' },
  { client: 'Mah Logistics Ltd', cat: 'B', subcat: 'internal_audit', fee: 450000, gstn: '27AABCE9012Q1ZB' },
  { client: 'Mah Accelo Ltd', cat: 'B', subcat: 'internal_audit', fee: 425000, gstn: '27AABCE3456Q1ZC' },
  { client: 'Bristlecone India Ltd', cat: 'B', subcat: 'internal_audit', fee: 250000, gstn: '27AABCE7890Q1ZD' },
  { client: 'Mah Auto Steel Pvt Ltd', cat: 'B', subcat: 'internal_audit', fee: 250000, gstn: '27AABCE1234Q1ZE' },
  { client: 'Mah Steel Service Center Ltd', cat: 'B', subcat: 'internal_audit', fee: 150000, gstn: '27AABCE5678Q1ZF' },
  { client: 'Mahindra MSTC Recycling Pvt. Ltd', cat: 'B', subcat: 'internal_audit', fee: 50000, gstn: '27AABCE9012Q1ZG' },
  { client: 'LORDS Freight (India) Private Limited', cat: 'B', subcat: 'internal_audit', fee: 50000, gstn: '27AABCU3456Q1ZH' },
  { client: 'MLL Express Services Private Limited', cat: 'B', subcat: 'internal_audit', fee: 80000, gstn: '27AABCU7890Q1ZI' },
  { client: 'MLL Mobility Pvt. Ltd', cat: 'B', subcat: 'internal_audit', fee: 50000, gstn: '27AABCU1234Q1ZJ' }
];

for (const d of data) {
  const c = await pool.query(`INSERT INTO clients (name, status) VALUES ($1, 'active') RETURNING id`, [d.client]);
  const cid = c.rows[0].id;
  await pool.query(`INSERT INTO assignments (client_id, gstn, category, subcategory, scope_areas, total_fees, billed_amount, billing_cycle, partner_id, manager_id, status, fiscal_year)
    VALUES ($1, $2, $3, $4, $4, $5, $5, 'monthly', $6, $7, 'active', '2025-26')`,
    [cid, d.gstn, d.cat, d.subcat, d.fee, partnerId, hamzaId]);
}

console.log(`✅ Seeded ${data.length} clients and assignments`);

// Verify
const a = await pool.query(`SELECT COUNT(*) as cnt FROM assignments WHERE manager_id = $1`, [hamzaId]);
const p = await pool.query(`SELECT id, email, full_name, role FROM profiles WHERE id = $1`, [hamzaId]);
console.log('\n📊 Hamza Assignments:', a.rows[0].cnt);
console.log('👤 Hamza Profile:');
console.table(p.rows);

// Show sample assignments
const sample = await pool.query(`
  SELECT c.name, a.category, a.subcategory, a.total_fees, a.billed_amount
  FROM assignments a
  JOIN clients c ON a.client_id = c.id
  WHERE a.manager_id = $1
  LIMIT 5
`);
console.log('\n📋 Sample Assignments:');
console.table(sample.rows);

await pool.end();
process.exit();