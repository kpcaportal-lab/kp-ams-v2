import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { authenticate, requireRole, logAuditEvent } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/users — all users (admin/partner/director)
router.get('/', requireRole('admin', 'partner', 'director'), async (_req: Request, res: Response) => {
    try {
        let result;
        try {
            result = await pool.query(
                `SELECT p.id, p.email, p.role, p.full_name, p.display_name, p.is_active, p.created_at, p.reports_to,
                        rp.full_name as reports_to_name
                 FROM profiles p
                 LEFT JOIN profiles rp ON rp.id = p.reports_to
                 ORDER BY p.role, p.full_name`
            );
        } catch (dbErr: any) {
            if (dbErr.message.includes('column "reports_to" does not exist')) {
                console.warn('⚠️ reports_to column missing in profiles, falling back to simple user list');
                result = await pool.query(
                    `SELECT id, email, role, full_name, display_name, is_active, created_at
                     FROM profiles
                     ORDER BY role, full_name`
                );
            } else {
                throw dbErr;
            }
        }
        res.json(result.rows);
    } catch (err: unknown) { 
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error', detail: err instanceof Error ? err.message : String(err) }); 
    }
});



// GET /api/users/impersonation-list
router.get('/impersonation-list', requireRole('admin', 'partner', 'director'), async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, full_name, role, display_name FROM profiles 
             WHERE role IN ('manager', 'assistant_manager', 'director') 
             AND id != $1
             AND is_active = true
             ORDER BY role, full_name`,
             [req.user!.id]
        );
        res.json(result.rows);
    } catch (err: unknown) {
        console.error('Error fetching impersonation list:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/users/managers
router.get('/managers', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, display_name FROM profiles WHERE role IN ('manager', 'assistant_manager') AND is_active=true ORDER BY full_name"
        );
        res.json(result.rows);
    } catch (err: unknown) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/users/partners
router.get('/partners', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, display_name FROM profiles WHERE role='partner' AND is_active=true ORDER BY full_name"
        );
        res.json(result.rows);
    } catch (err: unknown) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/users — admin, partner, director
router.post('/', requireRole('admin', 'partner', 'director'), async (req: Request, res: Response) => {
    try {
        const { email, full_name, display_name, role, password, reports_to, work_file_url } = req.body;
        
        // Prevent partners and directors from making admins
        if (req.user?.role !== 'admin' && role === 'admin') {
            return res.status(403).json({ error: 'Only admins can create other admins' });
        }

        const hash = await bcrypt.hash(password || 'KpAms@2025', 10);
        const result = await pool.query(
            'INSERT INTO profiles (email, password_hash, role, full_name, display_name, reports_to) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, role, full_name',
            [email, hash, role, full_name, display_name || full_name, reports_to || null]
        );
        await logAuditEvent(req.user!, 'create', 'user', result.rows[0].id, { email, role }, req);
        res.status(201).json(result.rows[0]);
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/users/:id — toggle active, update role
router.patch('/:id', requireRole('admin', 'partner', 'director'), async (req: Request, res: Response) => {
    try {
        const { is_active, role, display_name, full_name, reports_to, work_file_url } = req.body;

        // Only allow admins to change the reporting structure
        if (reports_to !== undefined && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Only administrators can change reporting relationships' });
        }

        if (reports_to === req.params.id) {
            return res.status(400).json({ error: 'User cannot report to themselves' });
        }

        await pool.query(
            'UPDATE profiles SET is_active=COALESCE($1,is_active), role=COALESCE($2,role), display_name=COALESCE($3,display_name), full_name=COALESCE($4,full_name), reports_to=COALESCE($5,reports_to), updated_at=NOW() WHERE id=$6',
            [is_active, role, display_name, full_name, reports_to, req.params.id]
        );
        await logAuditEvent(req.user!, 'update', 'user', req.params.id, { is_active, role, full_name, reports_to }, req);
        res.json({ success: true });
    } catch (err: unknown) { res.status(500).json({ error: 'Server error' }); }
});

export default router;
