import pkg from 'pg';
const { Client } = pkg;

// Use the CORRECT eu-west-1 pooler host as established
const connectionString = "postgresql://postgres.dtwdrlxfqozoqmenhpih:thedeveloper%40321@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const spreadsheetData = [
  { type: 'Forensic Audits', client: 'Swadhar IDWC', scopeItem: 'Swadhar IDWC', scopeAreas: 'Embezzlement', billingAmount: 250000, billedAmount: 250000, amountReceipt: 250000 },
  { type: 'Forensic Audits', client: 'ACG PAM Pharma Pvt Ltd', scopeItem: 'ACG PAM Pharma', scopeAreas: 'Contract Labour', billingAmount: 200000, billedAmount: 200000, amountReceipt: 200000 },
  { type: 'Forensic Audits', client: 'ATS Nashik', scopeItem: 'ATS Nashik', scopeAreas: 'JIIU', billingAmount: 250000, billedAmount: 250000, amountReceipt: 0 },
  { type: 'Forensic Audits', client: 'EOW', scopeItem: 'EOW 139', scopeAreas: 'Mohan Bajaj and Pote Family', billingAmount: 200000, billedAmount: 200000, amountReceipt: 0 },
  { type: 'Forensic Audits', client: 'Accent Packaging Pvt Ltd', scopeItem: 'Accent Packaging', scopeAreas: 'Liquidation', billingAmount: 190000, billedAmount: 190000, amountReceipt: 100000 },
  { type: 'Forensic Audits', client: 'EOW', scopeItem: 'EOW 78', scopeAreas: 'Deccan - Nahata and Maktedar', billingAmount: 250000, billedAmount: 250000, amountReceipt: 0 },
  { type: 'Forensic Audits', client: 'Raheja Vista Hsg Soc', scopeItem: 'Raheja', scopeAreas: 'Shaillesh Jadhav', billingAmount: 50000, billedAmount: 50000, amountReceipt: 50000 },
  { type: 'Forensic Audits', client: 'RB Technocrafts and Reclaimers Pvt Ltd', scopeItem: 'RB Tech', scopeAreas: 'Suman Sharma', billingAmount: 2500000, billedAmount: 2500000, amountReceipt: 1300000 },
  { type: 'Forensic Audits', client: 'Frigorifico Allana Pvt Ltd', scopeItem: 'Allana Oils', scopeAreas: 'Oil Division', billingAmount: 1200000, billedAmount: 1200000, amountReceipt: 1200000 },
  { type: 'Forensic Audits', client: 'Brembo India Pvt Ltd', scopeItem: 'Brembo', scopeAreas: 'Scrap', billingAmount: 200000, billedAmount: 200000, amountReceipt: 200000 },
  { type: 'Forensic Audits', client: 'IAC India Pvt Ltd', scopeItem: 'IAC India', scopeAreas: 'Tooling', billingAmount: 800000, billedAmount: 800000, amountReceipt: 800000 },
  { type: 'Forensic Audits', client: 'IVP Ltd', scopeItem: 'IVP Ltd', scopeAreas: 'Customer Collusion', billingAmount: 750000, billedAmount: 750000, amountReceipt: 750000 },
  { type: 'Forensic Audits', client: 'Metacast Auto Pvt Ltd', scopeItem: 'Forensic', scopeAreas: '', billingAmount: 25000, billedAmount: 25000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Eka Mobility Pvt Ltd', scopeItem: 'Pinnacle - EKA', scopeAreas: 'IA', billingAmount: 800000, billedAmount: 800000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'ATR', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'StatCompliance', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'P2P, Subcon', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'Inventory', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'O2C', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'SOP Drafting', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'SOP Drafting', billingAmount: 1500000, billedAmount: 1500000, amountReceipt: 150000 },
  { type: 'Mnmg Consulting', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'Costing Verification', billingAmount: 250000, billedAmount: 250000, amountReceipt: 250000 },
  { type: 'Mnmg Consulting', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'Production Review', billingAmount: 300000, billedAmount: 300000, amountReceipt: 200000 },
  { type: 'Internal Audit', client: 'John Deere India Pvt Ltd', scopeItem: 'JD', scopeAreas: 'Stock Take', billingAmount: 190400, billedAmount: 190400, amountReceipt: 49600 },
  { type: 'Internal Audit', client: 'Mah Logistics Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Logistics Ltd', billingAmount: 450000, billedAmount: 450000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mah Accelo Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Accelo Ltd', billingAmount: 425000, billedAmount: 425000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Bristlecone India Ltd', scopeItem: 'Mahindra', scopeAreas: 'Bristlecone India Ltd', billingAmount: 250000, billedAmount: 250000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mah Auto Steel Pvt Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Auto Steel Pvt Ltd', billingAmount: 250000, billedAmount: 250000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mah Steel Service Center Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Steel Service Center Ltd', billingAmount: 150000, billedAmount: 150000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra MSTC Recycling Pvt. Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mahindra MSTC Recycling Pvt. Ltd', billingAmount: 50000, billedAmount: 50000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'LORDS Freight (India) Private Limited', scopeItem: 'Mahindra', scopeAreas: 'LORDS Freight (India) Private Limited', billingAmount: 50000, billedAmount: 50000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'MLL Express Services Private Limited', scopeItem: 'Mahindra', scopeAreas: 'MLL Express Services Private Limited', billingAmount: 80000, billedAmount: 80000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'MLL Mobility Pvt. Ltd', scopeItem: 'Mahindra', scopeAreas: 'MLL Mobility Pvt. Ltd', billingAmount: 50000, billedAmount: 50000, amountReceipt: 0 },
];

async function main() {
  try {
    console.log('🚀 Starting Database Stabilization & Hamza Data Import...');
    await client.connect();
    console.log('📡 Connected to database.');
    await client.query('BEGIN');
    console.log('🔓 Transaction started.');

    // 1. Purge problematic placeholder profiles (disabled to protect proposals)
    // await client.query("DELETE FROM profiles WHERE id::text LIKE '00000000-0000-0000-0000-%' OR email ILIKE '%@kirtanepandit.com'");
    console.log('✅ Skipped purging placeholder profiles.');

    // 2. Standardize Gmail Accounts
    const users = [
      { email: 'admin.kpams@gmail.com', name: 'System Admin', role: 'admin' },
      { email: 'milind.limaye@gmail.com', name: 'Milind Limaye', role: 'partner' },
      { email: 'tanmay.bodhe@gmail.com', name: 'Tanmay Bodhe', role: 'partner' },
      { email: 'rishabh.thakkar@gmail.com', name: 'Rishabh Thakkar', role: 'director' },
      { email: 'vibhuti.narang@gmail.com', name: 'Vibhuti Narang', role: 'manager' },
      { email: 'hamza.momin@gmail.com', name: 'Hamza Momin', role: 'manager' },
      { email: 'dhanashree.dekhane@gmail.com', name: 'Dhanashree Dekhane', role: 'manager' },
      { email: 'mohit.joshi@gmail.com', name: 'Mohit Joshi', role: 'manager' },
      { email: 'sanjeev.deshpande@gmail.com', name: 'Sanjeev Deshpande', role: 'manager' },
      { email: 'bhushan.patil@gmail.com', name: 'Bhushan Patil', role: 'manager' }
    ];

    const userMap: Record<string, string> = {};
    const passwordHash = '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS'; // KpAms@2025

    for (const u of users) {
      const { rows } = await client.query('SELECT id FROM profiles WHERE email = $1', [u.email]);
      let userId;
      if (rows.length > 0) {
        userId = rows[0].id;
        await client.query('UPDATE profiles SET full_name = $1, role = $2, is_active = true WHERE id = $3', [u.name, u.role, userId]);
      } else {
        const res = await client.query(
          "INSERT INTO profiles (email, full_name, role, password_hash, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id",
          [u.email, u.name, u.role, passwordHash]
        );
        userId = res.rows[0].id;
      }
      userMap[u.email] = userId;
    }
    console.log('✅ Standardized Gmail accounts.');

    // 3. Clear Assignments & Invoices for fresh import
    await client.query('DELETE FROM invoices');
    await client.query('DELETE FROM assignments');
    console.log('✅ Cleared existing assignments and invoices.');

    // 4. Import Hamza Data
    const hamzaId = userMap['hamza.momin@gmail.com'];
    const defaultPartnerId = userMap['milind.limaye@gmail.com'];
    const adminId = userMap['admin.kpams@gmail.com'];

    const uniqueClientNames = Array.from(new Set(spreadsheetData.map(r => r.client)));
    const clientMap: Record<string, string> = {};

    for (const name of uniqueClientNames) {
      const { rows: existing } = await client.query(`SELECT id FROM clients WHERE name = $1 LIMIT 1`, [name]);
      if (existing.length > 0) {
        clientMap[name] = existing[0].id;
      } else {
        const { rows: newClient } = await client.query(`INSERT INTO clients (name, status, gstn, added_by) VALUES ($1, 'active', 'UNREGISTERED', $2) RETURNING id`, [name, adminId]);
        clientMap[name] = newClient[0].id;
      }
    }

    for (const row of spreadsheetData) {
      const clientId = clientMap[row.client];
      if (!clientId) continue;

      let category = 'A';
      let subcategory = 'internal_audit';

      if (row.type === 'Forensic Audits') {
        category = 'C';
        subcategory = 'forensic_investigation';
      } else if (row.type === 'SOP Drafting') {
        category = 'G';
        subcategory = 'advisory';
      } else if (row.type === 'Mnmg Consulting') {
        category = 'H';
        subcategory = 'advisory';
      }

      const assignmentRes = await client.query(`
        INSERT INTO assignments (
          client_id, gstn, category, subcategory, scope_areas, 
          total_fees, billed_amount, amount_receipt, billing_cycle, 
          partner_id, manager_id, status, fiscal_year, created_at
        ) VALUES (
          $1, 'UNREGISTERED', $2, $3, $4, $5, $6, $7, 'one_time', $8, $9, 'active', '2025-26', NOW()
        ) RETURNING id
      `, [
        clientId, category, subcategory, row.scopeAreas || '',
        row.billingAmount, row.billedAmount, row.amountReceipt || 0, defaultPartnerId, hamzaId
      ]);

      const assignmentId = assignmentRes.rows[0].id;

      // If billed, create an invoice record to sync the system
      if (row.billedAmount > 0) {
        await client.query(`
          INSERT INTO invoices (
            assignment_id, invoice_date, 
            professional_fees, out_of_pocket, net_amount, billed_amount,
            narration, generated_by, created_at
          ) VALUES (
            $1, NOW(), $2, 0, $2, $2, $3, $4, NOW()
          )
        `, [assignmentId, row.billedAmount, `Initial billing for ${row.scopeItem}`, adminId]);
      }
    }

    const { rows: uniqueClients } = await client.query('SELECT count(*) FROM clients');
    console.log(`✅ Database stabilized. Client count: ${uniqueClients[0].count}`);

    await client.query('COMMIT');
    console.log('🎉 DB STABILIZATION SUCCESSFUL! Hamza\'s data is now present.');
  } catch (err: any) {
    console.error('❌ ORIGINAL ERROR:', err.message);
    if (err.stack) console.error(err.stack);
    try {
        if (client) await client.query('ROLLBACK');
    } catch (rbErr) {
        console.error('⚠️ Rollback failed:', rbErr);
    }
    console.error('❌ FATAL ERROR:', err);
  } finally {
    await client.end();
  }
}

main();
