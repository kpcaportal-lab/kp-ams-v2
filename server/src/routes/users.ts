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
            // Attempt to select all potential columns safely with the join
            result = await pool.query(
                `SELECT p.id, p.email, p.role, p.full_name, p.display_name, p.is_active, p.created_at, p.reports_to,
                        p.work_file_url, rp.full_name as reports_to_name
                 FROM profiles p
                 LEFT JOIN profiles rp ON rp.id = p.reports_to
                 ORDER BY 
                    CASE p.role
                        WHEN 'admin' THEN 1
                        WHEN 'partner' THEN 2
                        WHEN 'director' THEN 3
                        WHEN 'manager' THEN 4
                        WHEN 'assistant_manager' THEN 5
                        WHEN 'sr_executive' THEN 6
                        WHEN 'executive' THEN 7
                        WHEN 'analyst' THEN 8
                        WHEN 'staff' THEN 9
                        ELSE 10
                    END,
                    p.full_name`
            );
        } catch (dbErr: any) {
            console.warn('⚠️ Standard user query failed, attempting safe fallback:', dbErr.message);
            // Absolute minimal fallback that just gets everything that exists
            result = await pool.query(`SELECT * FROM profiles ORDER BY role, full_name`);
        }
        res.json(result.rows);
    } catch (err: any) { 
        console.error('Error in GET /api/users:', err);
        res.status(500).json({ 
            error: 'Server error', 
            detail: err.message,
            code: err.code 
        }); 
    }
});



// GET /api/users/impersonation-list
router.get('/impersonation-list', requireRole('admin', 'partner', 'director'), async (req: Request, res: Response) => {
    try {
        // Admin, Partner, and Director can see all managers and assistant_managers
        const result = await pool.query(
            `SELECT id, full_name, role, display_name FROM profiles 
             WHERE role IN ('manager', 'assistant_manager') 
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
        
        let result;
        try {
            result = await pool.query(
                'INSERT INTO profiles (email, password_hash, role, full_name, display_name, reports_to) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, role, full_name',
                [email, hash, role, full_name, display_name || full_name, reports_to || null]
            );
        } catch (dbErr: any) {
            if (dbErr.code === '42703' || dbErr.message.includes('column "reports_to"')) {
                console.warn('⚠️ reports_to column missing, inserting without it');
                result = await pool.query(
                    'INSERT INTO profiles (email, password_hash, role, full_name, display_name) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, role, full_name',
                    [email, hash, role, full_name, display_name || full_name]
                );
            } else {
                throw dbErr;
            }
        }

        await logAuditEvent(req.user!, 'create', 'user', result.rows[0].id, { email, role }, req);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error('Error in POST /api/users:', err);
        if (err && err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Server error', detail: err.message });
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

        const fields = ['is_active', 'role', 'display_name', 'full_name'];
        const updates: string[] = [];
        const params: any[] = [];

        fields.forEach(f => {
            if (req.body[f] !== undefined) {
                params.push(req.body[f]);
                updates.push(`${f} = $${params.length}`);
            }
        });

        if (updates.length > 0) {
            params.push(req.params.id);
            await pool.query(
                `UPDATE profiles SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${params.length}`,
                params
            );
        }

        // Handle reports_to separately if it exists
        if (reports_to !== undefined) {
            try {
                await pool.query('UPDATE profiles SET reports_to=$1 WHERE id=$2', [reports_to, req.params.id]);
            } catch (dbErr: any) {
                if (dbErr.code === '42703') {
                    console.warn('⚠️ reports_to column missing, skipping update');
                } else {
                    throw dbErr;
                }
            }
        }

        await logAuditEvent(req.user!, 'update', 'user', req.params.id, { is_active, role, full_name, reports_to }, req);
        res.json({ success: true });
    } catch (err: any) { 
        console.error('Error in PATCH /api/users:', err);
        res.status(500).json({ error: 'Server error', detail: err.message }); 
    }
});

export default router;
