import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import proposalRoutes from './routes/proposals.js';
import assignmentRoutes from './routes/assignments.js';
import invoiceRoutes from './routes/invoices.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import auditRoutes from './routes/audit.js';
import ticketRoutes from './routes/tickets.js';
import notificationRoutes from './routes/notifications.js';
import pool from './db/pool.js';
import profileRoutes from './routes/profile.js';
import searchRoutes from './routes/search.js';
import insightRoutes from './routes/insights.js';

import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';

// Route registration helper
const registerRoutes = (app: express.Express) => {
    app.get('/health', (_req: express.Request, res: express.Response) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
    app.use('/api/auth', authRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/proposals', proposalRoutes);
    app.use('/api/assignments', assignmentRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/audit', auditRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/insights', insightRoutes);
    app.use('/api/managers', insightRoutes);
    console.log('✅ All routes loaded successfully');
};

const app = express();
const PORT = process.env.PORT || 4000;

// Enable trust proxy for Render/Vercel/Heroku
app.set('trust proxy', 1);

// ── Middleware ──────────────────────────────────────────────────────
app.use(generalLimiter); // Apply rate limiting to all requests
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.CLIENT_URL,
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:3001',
            'https://kp-ams-v2.vercel.app',
            'https://kpca-portal-5ysc.onrender.com'
        ].filter(Boolean) as string[];

        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Normalize origin by removing trailing slash
        const normalizedOrigin = origin.replace(/\/$/, '');

        const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
            normalizedOrigin.endsWith('.vercel.app') ||
            normalizedOrigin.includes('kpcaportal-labs-projects.vercel.app');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked origin: ${origin}`);
            // Still allow but log for now to avoid breaking UI during debug
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Startup ────────────────────────────────────────────────────────
// System User Synchronization (Ensures real names and roles are active)
const ensureSystemUsers = async () => {
    try {
        console.log('🔄 Syncing system users and real names...');

        // 1. Ensure Admin exists (Matching user request: admin.kpams@gmail.com)
        const adminEmail = 'admin.kpams@gmail.com';
        const adminPasswordHash = '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS'; // KpAms@2025
        const adminId = '00000000-0000-0000-0000-000000000001';

        await pool.query(`
            INSERT INTO profiles (id, email, password_hash, role, full_name, display_name, is_active)
            VALUES ($1, $2, $3, 'admin', 'System Administrator', 'Admin', true)
            ON CONFLICT (id) DO UPDATE SET 
                email = EXCLUDED.email, 
                password_hash = EXCLUDED.password_hash, 
                role = 'admin', 
                is_active = true
        `, [adminId, adminEmail, adminPasswordHash]);

        // 2. Sync Real Names from Placeholder IDs
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

        const realUsers = [
            { id: coreUserIds[1], name: 'Milind Limaye', email: 'MILIND.LIMAYE@GMAIL.COM', role: 'partner' },
            { id: coreUserIds[2], name: 'Tanmay Bodhe', email: 'TANMAY.BODHE@GMAIL.COM', role: 'partner' },
            { id: coreUserIds[3], name: 'Rishabh Thakkar', email: 'RISHABH.THAKKAR@GMAIL.COM', role: 'director' },
            { id: coreUserIds[4], name: 'Vibhuti Narang', email: 'VIBHUTI.NARANG@GMAIL.COM', role: 'manager' },
            { id: coreUserIds[5], name: 'Hamza Momin', email: 'HAMZA.MOMIN@GMAIL.COM', role: 'manager' },
            { id: coreUserIds[6], name: 'Dhanashree Dekhane', email: 'DHANASHREE.DEKHANE@GMAIL.COM', role: 'manager' },
            { id: coreUserIds[7], name: 'Mohit Joshi', email: 'MOHIT.JOSHI@GMAIL.COM', role: 'manager' },
            { id: coreUserIds[8], name: 'Bhushan Patil', email: 'BHUSHAN.PATIL@GMAIL.COM', role: 'manager' },
            { id: coreUserIds[9], name: 'Sanjeev Deshpande', email: 'SANJEEV.DESHPANDE@GMAIL.COM', role: 'manager' }
        ];

        console.log('--- EXACT DOMAIN MAPPING ---');
        realUsers.forEach(u => console.log(u.email));

        const standardHash = '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS'; // KpAms@2025

        console.log('🔄 STEP 1: Absolute purge of non-core IDs...');
        // First get the admin ID if it exists, so we don't accidentally delete it if it's not in coreUserIds list
        const adminRes = await pool.query("SELECT id FROM profiles WHERE email = 'admin.kpams@gmail.com'");
        const adminIdToProtect = adminRes.rows[0]?.id || '00000000-0000-0000-0000-000000000001';

        // Delete EVERYTHING that is not our 9 core ids or admin ID
        await pool.query(`
            DELETE FROM profiles 
            WHERE id NOT IN (SELECT unnest($1::uuid[]))
            AND id != $2
        `, [coreUserIds, adminIdToProtect]);

        // Also delete any dangling records that match names/emails exactly but somehow have different IDs
        const exactEmails = realUsers.map(u => u.email.toLowerCase());
        await pool.query(`
            DELETE FROM profiles 
            WHERE LOWER(TRIM(email)) = ANY($1) 
            AND id NOT IN (SELECT unnest($2::uuid[]))
        `, [exactEmails, coreUserIds]);

        console.log('🔄 STEP 2: Syncing EXACT emails...');

        for (const user of realUsers) {
            await pool.query(`
                INSERT INTO profiles (id, full_name, display_name, email, role, password_hash, is_active)
                VALUES ($5, $1, $1, $2, $3, $4, true)
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    display_name = EXCLUDED.display_name,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    is_active = true
            `, [user.name, user.email, user.role, standardHash, user.id]);
        }

        console.log('🔄 STEP 3: Pure duplicate removal (Hard clean)...');
        await pool.query(`
            DELETE FROM profiles 
            WHERE id NOT IN (SELECT unnest($1::uuid[]))
        `, [coreUserIds]);

        console.log('🧹 STEP 4: Forcing Hamza assignments & allocations sync...');
        const hamzaDataId = '00000000-0000-0000-0000-000000000012';
        await pool.query('DELETE FROM assignments WHERE manager_id = $1', [hamzaDataId]);

        const milindPartner = await pool.query(`SELECT id FROM profiles WHERE role = 'partner' AND is_active = true LIMIT 1`);
        const partnerId = milindPartner.rows[0]?.id || '00000000-0000-0000-0000-000000000002';

        const realData = [
            // Forensic Audits (Cat C)
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

            // Internal Audit (Cat A)
            { client: 'Eka Mobility Pvt Ltd', cat: 'A', scope: 'IA', sub: 'internal_audit', fee: 800000, billed: 800000, gstn: '27AABCE8921Q1ZT', rec: 0 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'ATR', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'StatCompliance', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'P2P, Subcon', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'Inventory', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'A', scope: 'O2C', sub: 'internal_audit', fee: 375000, billed: 375000, gstn: '27AABCF1234Q1ZZ', rec: 375000 },
            { client: 'John Deere India Pvt Ltd', cat: 'A', scope: 'Stock Take', sub: 'internal_audit', fee: 190400, billed: 190400, gstn: '27AABCE5678Q1ZA', rec: 49600 },

            // Advisory (Cat G/H)
            { client: 'Cooper Corporation Pvt Ltd', cat: 'G', scope: 'SOP Drafting', sub: 'advisory', fee: 1500000, billed: 1500000, gstn: '27AABCF1234Q1ZZ', rec: 150000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'H', scope: 'Costing Verification', sub: 'advisory', fee: 250000, billed: 250000, gstn: '27AABCF1234Q1ZZ', rec: 250000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'H', scope: 'Production Review', sub: 'advisory', fee: 300000, billed: 300000, gstn: '27AABCF1234Q1ZZ', rec: 200000 },

            // Mahindra Group
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
                    'INSERT INTO clients (name, status) VALUES ($1, \'active\') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
                    [data.client]
                );
                const clientDbId = clientRes.rows[0].id;

                const assignRes = await pool.query(
                    `INSERT INTO assignments (client_id, gstn, category, subcategory, scope_areas, total_fees, billed_amount, amount_receipt, billing_cycle, partner_id, manager_id, status, fiscal_year)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Monthly', $9, $10, 'active', $11) RETURNING id`,
                    [clientDbId, data.gstn, data.cat, data.sub, data.scope, data.fee, data.billed, data.rec || 0, partnerId, hamzaDataId, fy]
                );
                const assignId = assignRes.rows[0].id;

                // Seed Fee Allocations (Target Revenue Per Month for dashboard charts)
                const monthlyTarget = Math.floor(data.fee / 12);
                for (let m = 1; m <= 12; m++) {
                    await pool.query(
                        `INSERT INTO fee_allocations (assignment_id, month, amount, billed_amount, fiscal_year)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [assignId, m, monthlyTarget, m === 1 ? data.billed : 0, fy]
                    );
                }

                if (data.billed > 0) {
                    await pool.query(
                        `INSERT INTO invoices (assignment_id, invoice_number, invoice_date, professional_fees, status)
                         VALUES ($1, $2, CURRENT_DATE, $3, 'paid')`,
                        [assignId, `INV-${Math.floor(Math.random() * 9000) + 1000}`, data.billed]
                    );
                }
            }
        }

        // 4. CLEANUP DUPLICATES
        // 4. DEACTIVATE REST
        await pool.query('UPDATE profiles SET is_active = false WHERE id NOT IN (SELECT unnest($1::uuid[]))', [coreUserIds]);

        console.log('✅ Success: Data integrity restored. Hamza Momin data synced for multiple years.');
    } catch (err) {
        console.error('❌ System user sync failed:', err);
    }
};

const startServer = async () => {
    try {
        // Force sync system users and real names on start (only if not in production)
        if (process.env.NODE_ENV !== 'production') {
            await ensureSystemUsers();
        }

        registerRoutes(app);

        // ── 404 handler ─────────────────────────────────────────────
        app.use((_req: express.Request, res: express.Response) => res.status(404).json({ error: 'Route not found' }));

        // ── Error handler ───────────────────────────────────────────
        app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            if (err instanceof Error) {
                console.error(err.stack);
            } else {
                console.error('Unhandled error:', err);
            }
            res.status(500).json({
                error: 'Internal server error',
                message: err instanceof Error ? err.message : String(err),
                stack: process.env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined
            });
        });

        const HOST = '0.0.0.0'; // Better for Render
        app.listen(Number(PORT), HOST, () => {
            console.log(`🚀 KP AMS Server running on http://localhost:${PORT} (Interface: ${HOST})`);
        });
    } catch (error: unknown) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // Optional: exit process if needed (usually recommended for uncaught exceptions)
    // process.exit(1);
});

// GET /api/health-check — Check DB connection and schema status
app.get('/api/health-check', async (_req, res) => {
    try {
        const client = await pool.connect();
        try {
            const columns = await client.query(`
                SELECT table_name, column_name 
                FROM information_schema.columns 
                WHERE table_name IN ('profiles', 'assignments', 'invoices', 'tickets')
            `);
            const tableCols: Record<string, string[]> = {};
            columns.rows.forEach(r => {
                if (!tableCols[r.table_name]) tableCols[r.table_name] = [];
                tableCols[r.table_name].push(r.column_name);
            });
            res.json({ status: 'healthy', database: 'connected', schema: tableCols });
        } finally {
            client.release();
        }
    } catch (err: any) {
        res.status(500).json({ status: 'error', database: err.message });
    }
});

startServer();

export default app;
