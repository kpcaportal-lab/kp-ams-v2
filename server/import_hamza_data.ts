import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

const MANAGER_ID = '00000000-0000-0000-0000-000000000012'; // Hamza Momin
const PARTNER_ID = '00000000-0000-0000-0000-000000000002'; // Rishabh Thakkar

const spreadsheetData = [
  // Forensic Audits
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

  // Internal Audit
  { type: 'Internal Audit', client: 'Eka Mobility Pvt Ltd', scopeItem: 'Pinnacle - EKA', scopeAreas: 'IA', billingAmount: 800000, billedAmount: 800000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'ATR', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'StatCompliance', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'P2P, Subcon', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'Inventory', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  { type: 'Internal Audit', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'O2C', billingAmount: 375000, billedAmount: 375000, amountReceipt: 375000 },
  
  // SOP Drafting
  { type: 'SOP Drafting', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'SOP Drafting', billingAmount: 1500000, billedAmount: 1500000, amountReceipt: 150000 },
  
  // Mnmg Consulting
  { type: 'Mnmg Consulting', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'Costing Verification', billingAmount: 250000, billedAmount: 250000, amountReceipt: 250000 },
  { type: 'Mnmg Consulting', client: 'Cooper Corporation Pvt Ltd', scopeItem: 'Cooper', scopeAreas: 'Production Review', billingAmount: 300000, billedAmount: 300000, amountReceipt: 200000 },
  
  // Internal Audit
  { type: 'Internal Audit', client: 'John Deere India Pvt Ltd', scopeItem: 'JD', scopeAreas: 'Stock Take', billingAmount: 190400, billedAmount: 190400, amountReceipt: 49600 },
  
  // Mahindra
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'Mah Logistics Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Logistics Ltd', billingAmount: 450000, billedAmount: 450000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'Mah Accelo Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Accelo Ltd', billingAmount: 425000, billedAmount: 425000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'Bristlecone India Ltd', scopeItem: 'Mahindra', scopeAreas: 'Bristlecone India Ltd', billingAmount: 250000, billedAmount: 250000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'Mah Auto Steel Pvt Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Auto Steel Pvt Ltd', billingAmount: 250000, billedAmount: 250000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'Mah Steel Service Center Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mah Steel Service Center Ltd', billingAmount: 150000, billedAmount: 150000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'Mahindra MSTC Recycling Pvt. Ltd', scopeItem: 'Mahindra', scopeAreas: 'Mahindra MSTC Recycling Pvt. Ltd', billingAmount: 50000, billedAmount: 50000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'LORDS Freight (India) Private Limited', scopeItem: 'Mahindra', scopeAreas: 'LORDS Freight (India) Private Limited', billingAmount: 50000, billedAmount: 50000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'MLL Express Services Private Limited', scopeItem: 'Mahindra', scopeAreas: 'MLL Express Services Private Limited', billingAmount: 80000, billedAmount: 80000, amountReceipt: 0 },
  { type: 'Internal Audit', client: 'Mahindra and Mahindra Lt', subsidiary: 'MLL Mobility Pvt. Ltd', scopeItem: 'Mahindra', scopeAreas: 'MLL Mobility Pvt. Ltd', billingAmount: 50000, billedAmount: 50000, amountReceipt: 0 },
];

async function main() {
  try {
    await pool.query('BEGIN');

    // 1. Delete old generated dummy clients
    const dummyClients = ['Apex Infra', 'Zenith', 'Nova', 'Sterling', 'Meridian', 'Apex Innovations', 'Nova Healthcare Systems', 'Meridian Corp', 'Sterling Financial', 'Zenith Healthcare', 'Apex', 'Nova Healthcare'];
    
    // Convert to query string for IN clause
    const inClause = dummyClients.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: clientsToDelete } = await pool.query(`SELECT id FROM clients WHERE name IN (${inClause})`, dummyClients);

    if (clientsToDelete.length > 0) {
      const clientIds = clientsToDelete.map(c => c.id);
      const cInClause = clientIds.map((_, i) => `$${i + 1}`).join(', ');
      
      const { rows: assignments } = await pool.query(`SELECT id FROM assignments WHERE client_id IN (${cInClause})`, clientIds);
      const aIds = assignments.map(a => a.id);
      
      if (aIds.length > 0) {
        const aInClause = aIds.map((_, i) => `$${i + 1}`).join(', ');
        await pool.query(`DELETE FROM fee_allocations WHERE assignment_id IN (${aInClause})`, aIds);
        await pool.query(`DELETE FROM invoices WHERE assignment_id IN (${aInClause})`, aIds);
      }
      await pool.query(`DELETE FROM assignments WHERE client_id IN (${cInClause})`, clientIds);
      await pool.query(`DELETE FROM proposals WHERE client_id IN (${cInClause})`, clientIds);
      await pool.query(`DELETE FROM clients WHERE id IN (${cInClause})`, clientIds);
      console.log('Deleted dummy client data.');
    }

    // 2. Insert new clients (unique)
    const uniqueClientNames = Array.from(new Set(spreadsheetData.map(r => r.client)));
    const clientMap: Record<string, string> = {};

    for (const name of uniqueClientNames) {
      const { rows: existing } = await pool.query(`SELECT id FROM clients WHERE name = $1 LIMIT 1`, [name]);
      if (existing.length > 0) {
        clientMap[name] = existing[0].id;
      } else {
        const { rows: newClient } = await pool.query(`INSERT INTO clients (name, status, gstn) VALUES ($1, 'active', 'UNREGISTERED') RETURNING id`, [name]);
        clientMap[name] = newClient[0].id;
      }
    }

    // 3. Insert Assignments
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

      await pool.query(`
        INSERT INTO assignments (
          client_id, category, subcategory, scope_item, scope_areas, 
          total_fees, billed_amount, amount_receipt, billing_cycle, 
          partner_id, manager_id, status, fiscal_year, created_by, gstn
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 'one_time', $9, $10, 'active', '2025-26', $11, 'UNREGISTERED'
        )
      `, [
        clientId, category, subcategory, row.scopeItem || row.client, row.scopeAreas || '',
        row.billingAmount, row.billedAmount, row.amountReceipt,
        PARTNER_ID, MANAGER_ID, '00000000-0000-0000-0000-000000000001'
      ]);
    }

    await pool.query('COMMIT');
    console.log('Successfully imported Hamza Momin data.');
    process.exit(0);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    process.exit(1);
  }
}

main();
