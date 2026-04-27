import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:thedeveloper%40321@db.dtwdrlxfqozoqmenhpih.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
});

const executeSync = async () => {
    try {
        console.log('🔄 Connecting to Database for FORCE SYNC...');

        // Target explicit emails to keep
        const adminEmail = 'admin.kpams@gmail.com';
        const adminId = '00000000-0000-0000-0000-000000000001';

        const coreUserIds = [
            adminId,
            '00000000-0000-0000-0000-000000000002', // Milind
            '00000000-0000-0000-0000-000000000003', // Tanmay
            '00000000-0000-0000-0000-000000000005', // Rishabh
            '00000000-0000-0000-0000-000000000011', // Vibhuti
            '00000000-0000-0000-0000-000000000012', // Hamza
            '00000000-0000-0000-0000-000000000015', // Dhanashree
            '00000000-0000-0000-0000-000000000016', // Mohit
            '00000000-0000-0000-0000-000000000017', // Bhushan
            '00000000-0000-0000-0000-000000000018'  // Sanjeev
        ];

        // EXACT matching to the user's screenshot
        const realUsers = [
            { id: coreUserIds[1], name: 'Milind Limaye', email: 'milind.limaye@gmail.com', role: 'partner' },
            { id: coreUserIds[2], name: 'Tanmay Bodhe', email: 'tanmay.bodhe@gmail.com', role: 'partner' },
            { id: coreUserIds[3], name: 'Rishabh Thakkar', email: 'rishabh.thakkar@gmail.com', role: 'director' },
            { id: coreUserIds[4], name: 'Vibhuti Narang', email: 'vibhuti.narang@gmail.com', role: 'manager' },
            { id: coreUserIds[5], name: 'Hamza Momin', email: 'hamza.momin@gmail.com', role: 'manager' },
            { id: coreUserIds[6], name: 'Dhanashree Dekhane', email: 'dhanashree.dekhane@gmail.com', role: 'manager' },
            { id: coreUserIds[7], name: 'Mohit Joshi', email: 'mohit.joshi@gmail.com', role: 'manager' },
            { id: coreUserIds[8], name: 'Bhushan Patil', email: 'bhushan.patil@gmail.com', role: 'manager' },
            { id: coreUserIds[9], name: 'Sanjeev Deshpande', email: 'sanjeev.deshpande@gmail.com', role: 'manager' }
        ];

        // 1. DELETE EVERY PROFILE THAT IS NOT IN OUR EXACT CORE ID LIST
        console.log('🧹 1. Aggressive purge of all non-core IDs...');
        await pool.query(`DELETE FROM profiles WHERE id NOT IN (SELECT unnest($1::uuid[]))`, [coreUserIds]);

        // 2. Also delete if there's any stray record holding our emails but with wrong IDs 
        // (Just to be absolutely safe)
        const emailsToProtect = realUsers.map(u => u.email.toLowerCase());
        emailsToProtect.push(adminEmail.toLowerCase());
        await pool.query(`DELETE FROM profiles WHERE LOWER(email) = ANY($1) AND id NOT IN (SELECT unnest($2::uuid[]))`, [emailsToProtect, coreUserIds]);

        // 3. UPSERT Core Users
        console.log('🔄 2. Syncing exact user list...');
        const standardHash = '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS';

        await pool.query(`
            INSERT INTO profiles (id, email, password_hash, role, full_name, display_name, is_active)
            VALUES ($1, $2, $3, 'admin', 'System Administrator', 'Admin', true)
            ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = 'admin', is_active = true
        `, [adminId, adminEmail, standardHash]);

        for (const user of realUsers) {
            await pool.query(`
                INSERT INTO profiles (id, full_name, display_name, email, role, password_hash, is_active)
                VALUES ($5, $1, $1, $2, $3, $4, true)
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    is_active = true
            `, [user.name, user.email.toLowerCase(), user.role, standardHash, user.id]);
        }

        // 4. Force Hamza Momin Assignments
        console.log('🧹 3. Forcing Hamza assignments & allocations...');
        const hamzaDataId = '00000000-0000-0000-0000-000000000012';
        await pool.query('DELETE FROM assignments WHERE manager_id = $1', [hamzaDataId]);

        const partnerId = '00000000-0000-0000-0000-000000000002'; // Milind

        const realData = [
            { client: 'Swadhar IDWC', cat: 'C', scope: 'Embezzelment', sub: 'forensic_investigation', fee: 250000, billed: 250000, gstn: '27AAAAA0000A1ZR', rec: 250000 },
            { client: 'ACG PAM Pharma Pvt Ltd', cat: 'C', scope: 'Contract Labour', sub: 'forensic_investigation', fee: 200000, billed: 200000, gstn: '27AABCB0892Q1ZS', rec: 200000 },
            { client: 'ATS Nashik', cat: 'C', scope: 'JIIU', sub: 'forensic_investigation', fee: 250000, billed: 250000, gstn: '27AABCU9602Q1ZT', rec: 0 },
            { client: 'EOW', cat: 'C', scope: 'Mohan Bajaj and Pote Family', sub: 'forensic_investigation', fee: 200000, billed: 200000, gstn: '27AAAAA0000A1ZR', rec: 0 },
            { client: 'Accent Packaging Pvt Ltd', cat: 'C', scope: 'Liquidation', sub: 'forensic_investigation', fee: 190000, billed: 190000, gstn: '27AABCB0892Q1ZS', rec: 100000 },
            { client: 'EOW', cat: 'C', scope: 'Deccan - Nahata and Maktedar', sub: 'forensic_investigation', fee: 250000, billed: 250000, gstn: '27AAAAA0000A1ZR', rec: 0 },
            { client: 'Raheja Vista Hsg Soc', cat: 'C', scope: 'Shaillesh Jadhav', sub: 'forensic_investigation', fee: 50000, billed: 50000, gstn: '27AABCB0892Q1ZS', rec: 50000 },
            { client: 'RB Technocrafts and Reclaimers Pvt Ltd', cat: 'C', scope: 'Suman Sharma', sub: 'forensic_investigation', fee: 2500000, billed: 2500000, gstn: '27AABCB0892Q1ZS', rec: 1300000 },
            { client: 'Frigorifico Allana Pvt Ltd', cat: 'C', scope: 'Oil Division', sub: 'forensic_investigation', fee: 1200000, billed: 1200000, gstn: '27AABCB0892P1ZZ', rec: 1200000 },
            { client: 'Brembo India Pvt Ltd', cat: 'C', scope: 'Scrap', sub: 'forensic_investigation', fee: 200000, billed: 200000, gstn: '27AABCB0892Q1ZS', rec: 200000 },
            { client: 'IAC India Pvt Ltd', cat: 'C', scope: 'Tooling', sub: 'forensic_investigation', fee: 800000, billed: 800000, gstn: '27AABCB0892Q1ZS', rec: 800000 },
            { client: 'IVP Ltd', cat: 'C', scope: 'Customer Collusion', sub: 'forensic_investigation', fee: 750000, billed: 750000, gstn: '27AABCB0892Q1ZS', rec: 750000 },
            { client: 'Metacast Auto Pvt Ltd', cat: 'C', scope: 'Forensic', sub: 'forensic_investigation', fee: 25000, billed: 25000, gstn: '27AABCB0892Q1ZS', rec: 0 },
            { client: 'Eka Mobility Pvt Ltd', cat: 'A', scope: 'IA', sub: 'internal_audit', fee: 800000, billed: 800000, gstn: '27AABCE8921Q1ZT', rec: 0 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'ATR', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'StatCompliance', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'P2P, Subcon', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'Inventory', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'O2C', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'John Deere India Pvt Ltd', cat: 'A', scope: 'Stock Take', sub: 'internal_audit', fee: 190400, billed: 190400, gstn: '27AABCE5678Q1ZA', rec: 49600 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'G', scope: 'SOP Drafting', sub: 'advisory', fee: 1500000, billed: 1500000, gstn: '27AABCF1234Q1ZZ', rec: 150000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'H', scope: 'Costing Verification', sub: 'advisory', fee: 250000, billed: 250000, gstn: '27AABCF1234Q1ZZ', rec: 250000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'H', scope: 'Production Review', sub: 'advisory', fee: 300000, billed: 300000, gstn: '27AABCF1234Q1ZZ', rec: 200000 },
            { client: 'Mah Logistics Ltd', cat: 'A', scope: 'Mah Logistics Ltd', sub: 'internal_audit', fee: 450000, billed: 450000, gstn: '27AABCE9012Q1ZB', rec: 0 },
            { client: 'Mah Accelo Ltd', cat: 'A', scope: 'Mah Accelo Ltd', sub: 'internal_audit', fee: 425000, billed: 425000, gstn: '27AABCE3456Q1ZC', rec: 0 },
            { client: 'Bristlecone India Ltd', cat: 'A', scope: 'Bristlecone India Ltd', sub: 'internal_audit', fee: 250000, billed: 250000, gstn: '27AABCE7890Q1ZD', rec: 0 },
            { client: 'Mah Auto Steel Pvt Ltd', cat: 'A', scope: 'Mah Auto Pvt Ltd', sub: 'internal_audit', fee: 250000, billed: 250000, gstn: '27AABCE1234Q1ZE', rec: 0 },
            { client: 'Mah Steel Service Center Ltd', cat: 'A', scope: 'Mah Steel Service Center Ltd', sub: 'internal_audit', fee: 150000, billed: 150000, gstn: '27AABCE5678Q1ZF', rec: 0 },
            { client: 'Mahindra MSTC Recycling Pvt. Ltd', cat: 'A', scope: 'Recycling IA', sub: 'internal_audit', fee: 50000, billed: 50000, gstn: '27AABCE9012Q1ZG', rec: 0 },
            { client: 'LORDS Freight (India) Private Limited', cat: 'A', scope: 'IA', sub: 'internal_audit', fee: 50000, billed: 50000, gstn: '27AABCU3456Q1ZH', rec: 0 },
            { client: 'MLL Express Services Private Limited', cat: 'A', scope: 'IA', sub: 'internal_audit', fee: 80000, billed: 80000, gstn: '27AABCU7890Q1ZI', rec: 0 },
            { client: 'MLL Mobility Pvt. Ltd', cat: 'A', scope: 'IA', sub: 'internal_audit', fee: 50000, billed: 50000, gstn: '27AABCU1234Q1ZJ', rec: 0 }
        ];

        const years = ['2024-25', '2025-26', '2026-27'];
        for (const fy of years) {
            for (const data of realData) {
                const clientRes = await pool.query(
                    "INSERT INTO clients (name, status) VALUES ($1, 'active') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
                    [data.client]
                );
                const clientDbId = clientRes.rows[0].id;

                const assignRes = await pool.query(
                    `INSERT INTO assignments (client_id, gstn, category, subcategory, scope_areas, total_fees, billed_amount, amount_receipt, billing_cycle, partner_id, manager_id, status, fiscal_year)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Monthly', $9, $10, 'active', $11) RETURNING id`,
                    [clientDbId, data.gstn, data.cat, data.sub, data.scope, data.fee, data.billed, data.rec || 0, partnerId, hamzaDataId, fy]
                );
                const assignId = assignRes.rows[0].id;

                const monthlyTarget = Math.floor(data.fee / 12);
                for (let m = 1; m <= 12; m++) {
                    await pool.query(
                        `INSERT INTO fee_allocations (assignment_id, month, amount, billed_amount, fiscal_year)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [assignId, m, monthlyTarget, m === 1 ? data.billed : 0, fy]
                    );
                }
            }
        }

        console.log('✅ Final: DB force-synced.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
};

executeSync();
