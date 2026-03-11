import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin'));

// GET /api/audit/logs — paginated, filterable audit log
router.get('/logs', async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '50',
            user_id,
            action,
            entity_type,
            date_from,
            date_to,
            search
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT al.*, p.full_name as user_name
            FROM audit_logs al
            LEFT JOIN profiles p ON p.id = al.user_id
            WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) as total FROM audit_logs al WHERE 1=1`;
        const params: any[] = [];
        const countParams: any[] = [];

        if (user_id) {
            params.push(user_id);
            countParams.push(user_id);
            query += ` AND al.user_id = $${params.length}`;
            countQuery += ` AND al.user_id = $${countParams.length}`;
        }
        if (action) {
            params.push(action);
            countParams.push(action);
            query += ` AND al.action = $${params.length}`;
            countQuery += ` AND al.action = $${countParams.length}`;
        }
        if (entity_type) {
            params.push(entity_type);
            countParams.push(entity_type);
            query += ` AND al.entity_type = $${params.length}`;
            countQuery += ` AND al.entity_type = $${countParams.length}`;
        }
        if (date_from) {
            params.push(date_from);
            countParams.push(date_from);
            query += ` AND al.created_at >= $${params.length}::timestamptz`;
            countQuery += ` AND al.created_at >= $${countParams.length}::timestamptz`;
        }
        if (date_to) {
            params.push(date_to);
            countParams.push(date_to);
            query += ` AND al.created_at <= $${params.length}::timestamptz`;
            countQuery += ` AND al.created_at <= $${countParams.length}::timestamptz`;
        }
        if (search) {
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
            query += ` AND (al.user_email ILIKE $${params.length} OR al.entity_type ILIKE $${params.length})`;
            countQuery += ` AND (al.user_email ILIKE $${countParams.length} OR al.entity_type ILIKE $${countParams.length})`;
        }

        query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);

        const [logsResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        res.json({
            logs: logsResult.rows,
            total: Number(countResult.rows[0].total),
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(Number(countResult.rows[0].total) / Number(limit))
        });
    } catch (err) {
        console.error('Audit logs error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/audit/active-users — users with recent activity
router.get('/active-users', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id, p.full_name, p.display_name, p.email, p.role, p.is_active,
                al.last_active, al.last_action, al.total_actions_today
            FROM profiles p
            LEFT JOIN LATERAL (
                SELECT 
                    MAX(created_at) as last_active,
                    (SELECT action FROM audit_logs WHERE user_id = p.id ORDER BY created_at DESC LIMIT 1) as last_action,
                    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as total_actions_today
                FROM audit_logs
                WHERE user_id = p.id
            ) al ON true
            WHERE p.is_active = true
            ORDER BY al.last_active DESC NULLS LAST
        `);

        res.json(result.rows);
    } catch (err) {
        console.error('Active users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/audit/stats — summary statistics for admin dashboard
router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const [loginStats, actionStats, topUsers] = await Promise.all([
            // Login count over last 7 days
            pool.query(`
                SELECT DATE(created_at) as date, COUNT(*) as logins
                FROM audit_logs
                WHERE action = 'login' AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY date
            `),
            // Action breakdown today
            pool.query(`
                SELECT action, COUNT(*) as count
                FROM audit_logs
                WHERE created_at >= CURRENT_DATE
                GROUP BY action
                ORDER BY count DESC
            `),
            // Most active users today
            pool.query(`
                SELECT p.full_name, p.role, COUNT(*) as actions
                FROM audit_logs al
                JOIN profiles p ON p.id = al.user_id
                WHERE al.created_at >= CURRENT_DATE
                GROUP BY p.full_name, p.role
                ORDER BY actions DESC
                LIMIT 10
            `)
        ]);

        res.json({
            loginsByDay: loginStats.rows,
            actionBreakdown: actionStats.rows,
            topUsers: topUsers.rows
        });
    } catch (err) {
        console.error('Audit stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/audit/change-history — consolidated change history view
router.get('/change-history', async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50', entity_type, entity_id } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT ch.*, p.full_name as changed_by_name, p.role as changed_by_role
            FROM change_history ch
            LEFT JOIN profiles p ON p.id = ch.changed_by
            WHERE 1=1`;
        const params: any[] = [];

        if (entity_type) { params.push(entity_type); query += ` AND ch.entity_type = $${params.length}`; }
        if (entity_id) { params.push(entity_id); query += ` AND ch.entity_id = $${params.length}`; }

        query += ` ORDER BY ch.changed_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Change history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
