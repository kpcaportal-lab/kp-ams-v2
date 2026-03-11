import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { logAuditEvent } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    console.log(`📡 Login attempt: ${req.body.email}`);
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const result = await pool.query(
            'SELECT * FROM profiles WHERE email = $1 AND is_active = true',
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
            process.env.JWT_SECRET as string,
            { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
        );

        // Log login event for admin audit trail
        await logAuditEvent(
            { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
            'login',
            'auth',
            user.id,
            { email: user.email },
            req
        );

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                display_name: user.display_name,
            },
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Login Error:', error.message || error);
        if (error.stack) console.error(error.stack);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: 'Unauthorized' });
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const result = await pool.query(
            'SELECT id, email, role, full_name, display_name FROM profiles WHERE id = $1',
            [decoded.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.json(result.rows[0]);
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
