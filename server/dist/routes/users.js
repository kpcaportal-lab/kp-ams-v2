import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, requireRole, logAuditEvent } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// GET /api/users — all users (admin/partner/director)
router.get('/', requireRole('admin', 'partner', 'director'), async (_req, res) => {
    try {
        const result = await pool.query(`SELECT p.id, p.email, p.role, p.full_name, p.display_name, p.is_active, p.created_at, p.reports_to,
                    rp.full_name as reports_to_name
             FROM profiles p
             LEFT JOIN profiles rp ON rp.id = p.reports_to
             ORDER BY p.role, p.full_name`);
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/users/managers
router.get('/managers', async (_req, res) => {
    try {
        const result = await pool.query("SELECT id, full_name, display_name FROM profiles WHERE role='manager' AND is_active=true ORDER BY full_name");
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/users/partners
router.get('/partners', async (_req, res) => {
    try {
        const result = await pool.query("SELECT id, full_name, display_name FROM profiles WHERE role='partner' AND is_active=true ORDER BY full_name");
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/users — admin only
router.post('/', requireRole('admin'), async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { email, full_name, display_name, role, password, reports_to } = req.body;
        const hash = await bcrypt.hash(password || 'KpAms@2025', 10);
        const result = await pool.query('INSERT INTO profiles (email, password_hash, role, full_name, display_name, reports_to) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, role, full_name', [email, hash, role, full_name, display_name || full_name, reports_to || null]);
        await logAuditEvent(req.user, 'create', 'user', result.rows[0].id, { email, role }, req);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505')
            return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Server error' });
    }
});
// PATCH /api/users/:id — toggle active, update role
router.patch('/:id', requireRole('admin', 'partner', 'director'), async (req, res) => {
    try {
        const { is_active, role, display_name, reports_to } = req.body;
        await pool.query('UPDATE profiles SET is_active=COALESCE($1,is_active), role=COALESCE($2,role), display_name=COALESCE($3,display_name), reports_to=COALESCE($4,reports_to), updated_at=NOW() WHERE id=$5', [is_active, role, display_name, reports_to, req.params.id]);
        await logAuditEvent(req.user, 'update', 'user', req.params.id, { is_active, role, reports_to }, req);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
export default router;
