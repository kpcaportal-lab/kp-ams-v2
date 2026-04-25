import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/notifications - Get user's notifications
router.get('/', async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err: unknown) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.params.id) {
        return res.status(400).json({ error: 'Notification id is required' });
    }

    try {
        const result = await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Notification not found' });
        res.json(result.rows[0]);
    } catch (err: unknown) {
        console.error('Error updating notification:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', async (req: Request, res: Response) => {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1`,
            [req.user.id]
        );
        res.json({ success: true });
    } catch (err: unknown) {
        console.error('Error marking all as read:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
