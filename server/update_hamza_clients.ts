import pool from './src/db/pool.ts';

async function setupHamza() {
    try {
        // Ensure Hamza's profile is correct (Manager 5 is Hamza)
        await pool.query(`
            UPDATE profiles 
            SET full_name = 'Hamza Momin', 
                email = 'hamza.momin@kpis.co.in',
                role = 'manager'
            WHERE id = '00000000-0000-0000-0000-000000000012' 
               OR email = 'manager5@kirtanepandit.com'
               OR full_name = 'Hamza Momin'
        `);

        const hamza = await pool.query("SELECT id FROM profiles WHERE full_name = 'Hamza Momin' OR email = 'hamza.momin@kpis.co.in'");
        const partner = await pool.query("SELECT id FROM profiles WHERE role = 'partner' LIMIT 1");
        
        if (hamza.rows.length === 0) {
            console.log("Hamza Momin not found");
            return;
        }
        if (partner.rows.length === 0) {
            console.log("No partner found");
            return;
        }

        const hamzaId = hamza.rows[0].id;
        const partnerId = partner.rows[0].id;

        console.log(`Hamza ID: ${hamzaId}`);
        console.log(`Partner ID: ${partnerId}`);

        // Delete related data first due to foreign keys
        await pool.query(`
            DELETE FROM email_logs WHERE invoice_id IN (
                SELECT id FROM invoices WHERE assignment_id IN (
                    SELECT id FROM assignments WHERE manager_id = $1
                )
            )
        `, [hamzaId]);
        
        await pool.query("DELETE FROM invoices WHERE assignment_id IN (SELECT id FROM assignments WHERE manager_id = $1)", [hamzaId]);
        
        // Delete current assignments
        await pool.query("DELETE FROM assignments WHERE manager_id = $1", [hamzaId]);
        console.log("Deleted old assignments and related data (invoices, logs)");

        // Add columns if they don't exist (billed_amount/amount_receipt might be useful for quick lookups)
        await pool.query("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS billed_amount NUMERIC(14,2) DEFAULT 0");
        await pool.query("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS amount_receipt NUMERIC(14,2) DEFAULT 0");

        const categoryMap: Record<string, string> = {
            "Forensic Audits": "C",
            "Internal Audit": "A",
            "SOP Drafting": "G",
            "Mnmg Consulting": "H"
        };

        const assignmentData = [
            { type: "Forensic Audits", client: "Swadhar IDWC", spec: "Swadhar IDWC", scope: "Embezzelment", fees: 250000, billed: 250000, receipt: 250000 },
            { type: "Forensic Audits", client: "ACG PAM Pharma Pvt Ltd", spec: "ACG PAM Pharma", scope: "Contract Labour", fees: 200000, billed: 200000, receipt: 200000 },
            { type: "Forensic Audits", client: "ATS Nashik", spec: "ATS Nashik", scope: "JIIU", fees: 250000, billed: 250000, receipt: 0 },
            { type: "Forensic Audits", client: "EOW", spec: "EOW 139", scope: "Mohan Bajaj and Pote Family", fees: 200000, billed: 200000, receipt: 0 },
            { type: "Forensic Audits", client: "Accent Packaging Pvt Ltd", spec: "Accent Packaging", scope: "Liquidation", fees: 190000, billed: 190000, receipt: 100000 },
            { type: "Forensic Audits", client: "EOW", spec: "EOW 78", scope: "Deccan - Nahata and Maktedar", fees: 250000, billed: 250000, receipt: 0 },
            { type: "Forensic Audits", client: "Raheja Vista Hsg Soc", spec: "Raheja", scope: "Shaillesh Jadhav", fees: 50000, billed: 50000, receipt: 50000 },
            { type: "Forensic Audits", client: "RB Technocrafts and Reclaimers Pvt ltd", spec: "RB Tech", scope: "Suman Sharma", fees: 2500000, billed: 2500000, receipt: 1300000 },
            { type: "Forensic Audits", client: "Frigorifico Allana Pvt Ltd", spec: "Allana Oils", scope: "Oil Division", fees: 1200000, billed: 1200000, receipt: 1200000 },
            { type: "Forensic Audits", client: "Brembo India Pvt Ltd", spec: "Brembo", scope: "Scrap", fees: 200000, billed: 200000, receipt: 200000 },
            { type: "Forensic Audits", client: "IAC India Pvt Ltd", spec: "IAC India", scope: "Tooling", fees: 800000, billed: 800000, receipt: 800000 },
            { type: "Forensic Audits", client: "IVP Ltd", spec: "IVP Ltd", scope: "Customer Collusion", fees: 750000, billed: 750000, receipt: 750000 },
            { type: "Forensic Audits", client: "Metacast Auto Pvt Ltd", spec: "Forensic", scope: "Forensic Audit", fees: 25000, billed: 25000, receipt: 0 },
            { type: "Internal Audit", client: "Eka Mobility Pvt Ltd", spec: "Pinnacle - EKA", scope: "IA", fees: 800000, billed: 800000, receipt: 0 },
            { type: "Internal Audit", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "ATR", fees: 375000, billed: 375000, receipt: 375000 },
            { type: "Internal Audit", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "StatCompliance", fees: 375000, billed: 375000, receipt: 375000 },
            { type: "Internal Audit", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "P2P, Subcon", fees: 375000, billed: 375000, receipt: 375000 },
            { type: "Internal Audit", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "Inventory", fees: 375000, billed: 375000, receipt: 375000 },
            { type: "Internal Audit", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "O2C", fees: 375000, billed: 375000, receipt: 375000 },
            { type: "SOP Drafting", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "SOP Drafting", fees: 1500000, billed: 1500000, receipt: 150000 },
            { type: "Mnmg Consulting", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "Costing Verification", fees: 250000, billed: 250000, receipt: 250000 },
            { type: "Mnmg Consulting", client: "Cooper Corporation Pvt Ltd", spec: "Cooper", scope: "Production Review", fees: 300000, billed: 300000, receipt: 200000 },
            { type: "Internal Audit", client: "John Deere India Pvt Ltd", spec: "JD", scope: "Stock Take", fees: 190400, billed: 190400, receipt: 49600 },
            { type: "Internal Audit", client: "Mahindra Logistics Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 450000, billed: 450000, receipt: 0 },
            { type: "Internal Audit", client: "Mahindra Accelo Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 425000, billed: 425000, receipt: 0 },
            { type: "Internal Audit", client: "Bristlecone India Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 250000, billed: 250000, receipt: 0 },
            { type: "Internal Audit", client: "Mahindra Auto Steel Pvt Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 250000, billed: 250000, receipt: 0 },
            { type: "Internal Audit", client: "Mahindra Steel Service Center Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 150000, billed: 150000, receipt: 0 },
            { type: "Internal Audit", client: "Mahindra MSTC Recycling Pvt. Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 50000, billed: 50000, receipt: 0 },
            { type: "Internal Audit", client: "LORDS Freight (India) Private Limited", spec: "Mahindra", scope: "Internal Audit", fees: 50000, billed: 50000, receipt: 0 },
            { type: "Internal Audit", client: "MLL Express Services Private Limited", spec: "Mahindra", scope: "Internal Audit", fees: 80000, billed: 80000, receipt: 0 },
            { type: "Internal Audit", client: "MLL Mobility Pvt. Ltd", spec: "Mahindra", scope: "Internal Audit", fees: 50000, billed: 50000, receipt: 0 }
        ];

        for (const data of assignmentData) {
            // Check if client exists
            let clientId;
            const existingClient = await pool.query("SELECT id FROM clients WHERE name = $1", [data.client]);
            if (existingClient.rows.length > 0) {
                clientId = existingClient.rows[0].id;
            } else {
                const newClient = await pool.query(
                    "INSERT INTO clients (name, status) VALUES ($1, 'active') RETURNING id",
                    [data.client]
                );
                clientId = newClient.rows[0].id;
            }

            const category = categoryMap[data.type] || 'A';

            // Create assignment
            const assignmentResult = await pool.query(`
                INSERT INTO assignments (client_id, gstn, category, scope_areas, notes, total_fees, billed_amount, amount_receipt, billing_cycle, partner_id, manager_id, fiscal_year, status)
                VALUES ($1, 'NA', $4, $5, $6, $7, $8, $9, 'monthly', $2, $3, '2025-26', 'active')
                RETURNING id
            `, [clientId, partnerId, hamzaId, category, data.scope, data.spec, data.fees, data.billed, data.receipt]);
            
            const assignmentId = assignmentResult.rows[0].id;

            // Create fee allocation for current month (e.g., April = 4)
            await pool.query(`
                INSERT INTO fee_allocations (assignment_id, month, fiscal_year, amount, billed_amount)
                VALUES ($1, 4, '2025-26', $2, $3)
            `, [assignmentId, data.fees, data.billed]);

            // Create invoice if receipt > 0
            if (data.receipt > 0) {
                await pool.query(`
                    INSERT INTO invoices (assignment_id, professional_fees, out_of_pocket, net_amount, narration, invoice_date)
                    VALUES ($1, $2, 0, $2, $3, NOW())
                `, [assignmentId, data.receipt, `Receipt for ${data.spec} - ${data.scope}`]);
            }
        }

        console.log(`Successfully added ${assignmentData.length} assignments with allocations and invoices for Hamza Momin`);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

setupHamza();
