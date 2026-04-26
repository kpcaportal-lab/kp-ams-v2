import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds } from '../middleware/auth.js';
import { validateCreateTicket, validateUpdateTicketStatus } from '../middleware/validation.js';

const router = Router();

router.use(authenticate);

// GET /api/tickets - List visible tickets
router.get('/', async (req: Request, res: Response) => {
    try {
        let query = `
            SELECT t.*, p.full_name as submitted_by_name 
            FROM tickets t
            LEFT JOIN profiles p ON t.submitted_by = p.id
        `;
        let params: unknown[] = [];

        // RBAC filtering
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            query += ' WHERE t.submitted_by = ANY($1)';
            params.push(visibleIds);
        }

        query += ' ORDER BY CASE t.status WHEN \'open\' THEN 1 WHEN \'in_progress\' THEN 2 WHEN \'resolved\' THEN 3 ELSE 4 END, t.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err: unknown) {
        console.error('Error fetching tickets:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tickets - Create a new ticket
router.post('/', ...validateCreateTicket, async (req: Request, res: Response) => {
    try {
        const { title, description, priority, attachment_url } = req.body;
        if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

        let newTicket;
        try {
            const result = await pool.query(
                `INSERT INTO tickets (title, description, priority, status, submitted_by, attachment_url)
                 VALUES ($1, $2, $3, 'open', $4, $5) RETURNING *`,
                [title, description, priority || 'medium', req.user!.id, attachment_url || null]
            );
            newTicket = result.rows[0];
        } catch (dbErr: any) {
            if (dbErr.message.includes('column "attachment_url" does not exist')) {
                console.warn('⚠️ attachment_url column missing in tickets table, retrying without it');
                const result = await pool.query(
                    `INSERT INTO tickets (title, description, priority, status, submitted_by)
                     VALUES ($1, $2, $3, 'open', $4) RETURNING *`,
                    [title, description, priority || 'medium', req.user!.id]
                );
                newTicket = result.rows[0];
            } else {
                throw dbErr;
            }
        }

        // Notify Admins and Partners
        try {
            const adminsResult = await pool.query(
                "SELECT id FROM profiles WHERE role IN ('admin', 'partner')"
            );
            
            const notificationPromises = adminsResult.rows.map(admin => {
                return pool.query(
                    `INSERT INTO notifications (user_id, message, type, entity_type, entity_id)
                     VALUES ($1, $2, 'ticket_update', 'ticket', $3)`,
                    [admin.id, `New ticket raised: ${title}`, newTicket.id]
                );
            });
            
            await Promise.all(notificationPromises);
        } catch (notifyErr) {
            console.error('Failed to send ticket notifications:', notifyErr);
        }

        res.status(201).json(newTicket);
    } catch (err: unknown) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/tickets/:id - Update ticket status (admin only for now, or self if needed)
router.patch('/:id', ...validateUpdateTicketStatus, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        // Basic check
        if (req.user!.role !== 'admin' && req.user!.role !== 'partner' && req.user!.role !== 'director') {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const result = await pool.query(
            `UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [status, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
        res.json(result.rows[0]);
    } catch (err: unknown) {
        console.error('Error updating ticket:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
