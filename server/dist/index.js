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
// Route registration helper
const registerRoutes = (app) => {
    app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
    app.use('/api/auth', authRoutes);
    app.use('/api/clients', clientRoutes);
    app.use('/api/proposals', proposalRoutes);
    app.use('/api/assignments', assignmentRoutes);
    app.use('/api/invoices', invoiceRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/users', userRoutes);
    console.log('✅ All routes loaded successfully');
};
const app = express();
const PORT = process.env.PORT || 4000;
// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'https://kp-ams.vercel.app',
        /\.vercel\.app$/,
    ],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// ── Startup ────────────────────────────────────────────────────────
const startServer = async () => {
    try {
        registerRoutes(app);
        // ── 404 handler ─────────────────────────────────────────────
        app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
        // ── Error handler ───────────────────────────────────────────
        app.use((err, _req, res, _next) => {
            if (err instanceof Error) {
                console.error(err.stack);
            }
            else {
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
