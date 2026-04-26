import pool from './src/db/pool.js';

const MANAGER_ID = '00000000-0000-0000-0000-000000000012'; // Hamza Momin
const PARTNER_ID = '00000000-0000-0000-0000-000000000005'; // Rishabh Thakkar
const ADMIN_ID = '00000000-0000-0000-0000-000000000001';

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
    console.log('Restoring Hamza Momin data (V3-Final-Fixed)...');
    await pool.query('BEGIN');

    // 1. Delete existing for Hamza
    await pool.query('DELETE FROM invoices WHERE assignment_id IN (SELECT id FROM assignments WHERE manager_id = $1)', [MANAGER_ID]);
    await pool.query('DELETE FROM assignments WHERE manager_id = $1', [MANAGER_ID]);

    // 2. Insert/Get Clients
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

    // 3. Insert Assignments and Invoices
    for (const row of spreadsheetData) {
      const clientId = clientMap[row.client];
      const { rows: assignment } = await pool.query(`
        INSERT INTO assignments (
          client_id, category, subcategory, scope_item, scope_areas, 
          total_fees, billing_cycle, partner_id, manager_id, 
          status, fiscal_year, created_by, gstn,
          amount_receipt, billed_amount
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'one_time', $7, $8, 'active', '2025-26', $9, 'UNREGISTERED', $10, $11
        ) RETURNING id
      `, [
        clientId, 
        row.type === 'Forensic Audits' ? 'C' : (row.type === 'SOP Drafting' ? 'G' : (row.type === 'Mnmg Consulting' ? 'H' : 'A')),
        row.type === 'Forensic Audits' ? 'forensic_investigation' : (row.type === 'SOP Drafting' ? 'advisory' : (row.type === 'Mnmg Consulting' ? 'advisory' : 'internal_audit')),
        row.scopeItem || row.client, 
        row.scopeAreas || '',
        row.billingAmount,
        PARTNER_ID, MANAGER_ID, ADMIN_ID, row.amountReceipt, row.billedAmount
      ]);

      const assignmentId = assignment[0].id;

      if (row.billedAmount > 0) {
        await pool.query(`
          INSERT INTO invoices (
            assignment_id, sr_no, invoice_date, 
            professional_fees, net_amount, billed_amount, narration, generated_by
          ) VALUES (
            $1, $2, NOW(), $3, $4, $5, $6, $7
          )
        `, [
          assignmentId, 
          Math.floor(Math.random() * 1000000), 
          row.billedAmount,
          row.billedAmount,
          row.billedAmount,
          `Invoice for ${row.scopeItem || row.client}`,
          ADMIN_ID
        ]);
      }
    }

    await pool.query('COMMIT');
    console.log('✅ Successfully restored Hamza Momin data (V3-Final-Fixed).');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Failed to restore Hamza Momin data:', err);
  } finally {
    process.exit();
  }
}

main();
