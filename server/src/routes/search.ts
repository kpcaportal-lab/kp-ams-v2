import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/search?q=term
router.get('/', async (req: Request, res: Response) => {
    try {
        const q = (req.query.q as string || '').trim();
        if (!q || q.length < 2) {
            return res.json({ clients: [], assignments: [], proposals: [], invoices: [] });
        }

        const searchPattern = `%${q}%`;

        // Search clients
        const clients = await pool.query(
            `SELECT id, name, gstn, status FROM clients 
             WHERE name ILIKE $1 OR gstn ILIKE $1 
             ORDER BY name LIMIT 5`,
            [searchPattern]
        );

        // Search assignments (by client name, proposal number, scope)
        const assignments = await pool.query(
            `SELECT a.id, a.status, a.total_fees, a.fiscal_year,
                    c.name as client_name, p.number as proposal_number
             FROM assignments a
             LEFT JOIN clients c ON c.id = a.client_id
             LEFT JOIN proposals p ON p.id = a.proposal_id
             WHERE c.name ILIKE $1 OR p.number ILIKE $1 OR a.scope_areas ILIKE $1
             ORDER BY a.created_at DESC LIMIT 5`,
            [searchPattern]
        );

        // Search proposals (by number, client name, scope)
        const proposals = await pool.query(
            `SELECT p.id, p.number, p.status, p.quotation_amount,
                    c.name as client_name
             FROM proposals p
             LEFT JOIN clients c ON c.id = p.client_id
             WHERE p.number ILIKE $1 OR c.name ILIKE $1 OR p.scope_areas ILIKE $1
             ORDER BY p.created_at DESC LIMIT 5`,
            [searchPattern]
        );

        // Search invoices (by narration, reference, client name via assignment)
        const invoices = await pool.query(
            `SELECT i.id, i.sr_no, i.invoice_date, i.net_amount, i.narration,
                    c.name as client_name, a.id as assignment_id
             FROM invoices i
             LEFT JOIN assignments a ON a.id = i.assignment_id
             LEFT JOIN clients c ON c.id = a.client_id
             WHERE i.narration ILIKE $1 OR i.reference ILIKE $1 OR c.name ILIKE $1
             ORDER BY i.invoice_date DESC LIMIT 5`,
            [searchPattern]
        );

        res.json({
            clients: clients.rows,
            assignments: assignments.rows,
            proposals: proposals.rows,
            invoices: invoices.rows
        });
    } catch (err: unknown) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

export default router;
