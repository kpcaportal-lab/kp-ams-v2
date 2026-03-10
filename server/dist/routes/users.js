import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// GET /api/users — all users (admin/partner/director)
router.get('/', requireRole('admin', 'partner', 'director'), async (_req, res) => {
    try {
        const result = await pool.query('SELECT id, email, role, full_name, display_name, is_active, created_at FROM profiles ORDER BY role, full_name');
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
        const { email, full_name, display_name, role, password } = req.body;
        const hash = await bcrypt.hash(password || 'KpAms@2025', 10);
        const result = await pool.query('INSERT INTO profiles (email, password_hash, role, full_name, display_name) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, role, full_name', [email, hash, role, full_name, display_name || full_name]);
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
        const { is_active, role, display_name } = req.body;
        await pool.query('UPDATE profiles SET is_active=COALESCE($1,is_active), role=COALESCE($2,role), display_name=COALESCE($3,display_name), updated_at=NOW() WHERE id=$4', [is_active, role, display_name, req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
export default router;
