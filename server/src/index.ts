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
        
        // 1. Ensure Admin exists
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

        // 2. Sync Real Names from Placeholder IDs (as defined in migration 015)
        const realUsers = [
            { id: '00000000-0000-0000-0000-000000000002', name: 'Milind Limaye', email: 'milind.limaye@kirtanepandit.com', role: 'partner' },
            { id: '00000000-0000-0000-0000-000000000003', name: 'Tanmay Bodhe', email: 'tanmay.bodhe@kirtanepandit.com', role: 'partner' },
            { id: '00000000-0000-0000-0000-000000000005', name: 'Rishabh Thakkar', email: 'rishabh.thakkar@kirtanepandit.com', role: 'director' },
            { id: '00000000-0000-0000-0000-000000000008', name: 'Sanjeev Deshpande', email: 'sanjeev.deshpande@kirtanepandit.com', role: 'manager' },
            { id: '00000000-0000-0000-0000-000000000009', name: 'Bhushan Patil', email: 'bhushan.patil@kirtanepandit.com', role: 'manager' },
            { id: '00000000-0000-0000-0000-000000000010', name: 'Mohit Joshi', email: 'mohit.joshi@kirtanepandit.com', role: 'manager' },
            { id: '00000000-0000-0000-0000-000000000011', name: 'Vibhuti Narang', email: 'vibhuti.narang@kirtanepandit.com', role: 'manager' },
            { id: '00000000-0000-0000-0000-000000000012', name: 'Hamza Momin', email: 'hamza.momin@kirtanepandit.com', role: 'manager' },
            { id: '00000000-0000-0000-0000-000000000013', name: 'Dhanashree Dekhane', email: 'dhanashree.dekhane@kirtanepandit.com', role: 'manager' }
        ];

        const standardHash = '$2a$10$uHfwPRTiaT4etSL/jjrsxupiFUWo/k2Pw0g5YgA3962OqD5kOCkvS'; // KpAms@2025

        for (const user of realUsers) {
            await pool.query(`
                UPDATE profiles 
                SET full_name = $1, display_name = $1, email = $2, role = $3, password_hash = $4, is_active = true 
                WHERE id = $5
            `, [user.name, user.email, user.role, standardHash, user.id]);
        }

        // 3. FULL DATA WIPE (Remove all old seed data)
        console.log('🧹 Wiping old seed data...');
        await pool.query('DELETE FROM invoices');
        await pool.query('DELETE FROM assignments');
        await pool.query('DELETE FROM proposals');
        await pool.query('DELETE FROM clients');

        // 4. SEED REAL DATA FOR HAMZA MOMIN (from Screenshot)
        console.log('🌱 Seeding real data for Hamza Momin...');
        const hamzaId = '00000000-0000-0000-0000-000000000012';
        const partnerId = '00000000-0000-0000-0000-000000000002'; // Milind Limaye as partner

        const realData = [
            { client: 'Swadhar IDWC', cat: 'Forensic Audits', scope: 'Embezzelment', fee: 250000, billed: 250000 },
            { client: 'ACG PAM Pharma Pvt Ltd', cat: 'Forensic Audits', scope: 'Contract Labour', fee: 200000, billed: 200000 },
            { client: 'ATS Nashik', cat: 'Forensic Audits', scope: 'JIIU', fee: 250000, billed: 250000 },
            { client: 'EOW', cat: 'Forensic Audits', scope: 'Mohan Bajaj and Pote Family', fee: 200000, billed: 200000 },
            { client: 'Accent Packaging Pvt Ltd', cat: 'Forensic Audits', scope: 'Liquidation', fee: 190000, billed: 190000 },
            { client: 'Eka Mobility Pvt Ltd', cat: 'Internal Audit', scope: 'IA', fee: 800000, billed: 800000 },
            { client: 'Cooper Corporation Pvt Ltd', cat: 'Internal Audit', scope: 'ATR', fee: 375000, billed: 375000 },
            { client: 'John Deere India Pvt Ltd', cat: 'Internal Audit', scope: 'Stock Take', fee: 190400, billed: 190400 },
            { client: 'Mah Logistics Ltd', cat: 'Internal Audit', scope: 'Mah Logistics Ltd', fee: 450000, billed: 450000 },
            { client: 'Mah Accelo Ltd', cat: 'Internal Audit', scope: 'Mah Accelo Ltd', fee: 425000, billed: 425000 },
            { client: 'Bristlecone India Ltd', cat: 'Internal Audit', scope: 'Bristlecone India Ltd', fee: 250000, billed: 250000 },
            { client: 'Mah Auto Steel Pvt Ltd', cat: 'Internal Audit', scope: 'Mah Auto Pvt Ltd', fee: 250000, billed: 250000 },
            { client: 'Mah Steel Service Center Ltd', cat: 'Internal Audit', scope: 'Mah Steel Service Center Ltd', fee: 150000, billed: 150000 },
            { client: 'Mahindra MSTC Recycling Pvt. Ltd', cat: 'Internal Audit', scope: 'Mahindra MSTC Recycling Pvt. Ltd', fee: 50000, billed: 50000 },
            { client: 'LORDS Freight (India) Private Limited', cat: 'Internal Audit', scope: 'LORDS Freight (India) Private Limited', fee: 50000, billed: 50000 },
            { client: 'MLL Express Services Private Limited', cat: 'Internal Audit', scope: 'MLL Express Services Private Limited', fee: 80000, billed: 80000 },
            { client: 'MLL Mobility Pvt. Ltd', cat: 'Internal Audit', scope: 'MLL Mobility Pvt. Ltd', fee: 50000, billed: 50000 }
        ];

        for (const data of realData) {
            // Create Client
            const clientRes = await pool.query(
                'INSERT INTO clients (name, status) VALUES ($1, \'active\') RETURNING id',
                [data.client]
            );
            const clientId = clientRes.rows[0].id;

            // Create Assignment
            const assignRes = await pool.query(
                `INSERT INTO assignments (client_id, category, scope_areas, total_fees, billing_cycle, partner_id, manager_id, status, fiscal_year)
                 VALUES ($1, $2, $3, $4, \'Monthly\', $5, $6, \'active\', \'2024-25\') RETURNING id`,
                [clientId, data.cat, data.scope, data.fee, partnerId, hamzaId]
            );
            const assignId = assignRes.rows[0].id;

            // Create Invoice (if billed)
            if (data.billed > 0) {
                await pool.query(
                    `INSERT INTO invoices (assignment_id, invoice_number, invoice_date, professional_fees, billed_amount, status)
                     VALUES ($1, $2, CURRENT_DATE, $3, $3, \'paid\')`,
                    [assignId, `INV-${Math.floor(Math.random() * 9000) + 1000}`, data.billed]
                );
            }
        }

        // 5. DEACTIVATE ALL OTHER USERS (Strict enforcement)
        const coreUserIds = [
            adminId,
            '00000000-0000-0000-0000-000000000002', // Milind Limaye
            '00000000-0000-0000-0000-000000000003', // Tanmay Bodhe
            '00000000-0000-0000-0000-000000000005', // Rishabh Thakkar
            '00000000-0000-0000-0000-000000000012'  // Hamza Momin
        ];

        await pool.query('UPDATE profiles SET is_active = false WHERE id NOT IN ($1, $2, $3, $4, $5)', coreUserIds);
        
        console.log('✅ Success: Wiped all seed data and loaded REAL data for Hamza Momin. Non-essential users deactivated.');
    } catch (err) {
        console.error('❌ System user sync failed:', err);
    }
};

const startServer = async () => {
    try {
        // Force sync system users and real names on start
        await ensureSystemUsers();
        
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
