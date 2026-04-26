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

        // 3. Data Consolidation: Reassign all seed data to Hamza Momin (ID ...012)
        // This ensures other managers show 0 data as requested
        const hamzaId = '00000000-0000-0000-0000-000000000012';
        
        // Reassign assignments
        await pool.query('UPDATE assignments SET manager_id = $1 WHERE manager_id != $1', [hamzaId]);
        
        // Reassign proposals
        await pool.query('UPDATE proposals SET prepared_by = $1 WHERE prepared_by != $1', [hamzaId]);
        
        // 4. Deactivate remaining dummy users
        await pool.query(`
            UPDATE profiles SET is_active = false 
            WHERE id IN (
                '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 
                '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000014',
                '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000016',
                '00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000018'
            )
        `);

        console.log('✅ System users synced and data consolidated to Hamza Momin');
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

startServer();

export default app;
