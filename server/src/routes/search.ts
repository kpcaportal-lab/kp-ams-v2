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
        
        const visibleIds = await getVisibleUserIds(req.user!);
        const searchPattern = `%${q}%`;

        // Search clients
        let clientsQuery = `
            SELECT c.id, c.name, c.gstn, c.status FROM clients c
            WHERE (c.name ILIKE $1 OR c.gstn ILIKE $1)`;
        const clientsParams: unknown[] = [searchPattern];
        if (visibleIds !== null) {
            clientsParams.push(visibleIds);
            clientsQuery += ` AND (c.added_by = ANY($2) OR EXISTS (
                SELECT 1 FROM assignments a WHERE a.client_id = c.id AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))
            ))`;
        }
        clientsQuery += ` ORDER BY c.name LIMIT 5`;

        const clients = await pool.query(clientsQuery, clientsParams);

        // Search assignments
        let assignmentsQuery = `
            SELECT a.id, a.status, a.total_fees, a.fiscal_year,
                    c.name as client_name, p.number as proposal_number
             FROM assignments a
             LEFT JOIN clients c ON c.id = a.client_id
             LEFT JOIN proposals p ON p.id = a.proposal_id
             WHERE (c.name ILIKE $1 OR p.number ILIKE $1 OR a.scope_areas ILIKE $1)`;
        const assignmentsParams: unknown[] = [searchPattern];
        if (visibleIds !== null) {
            assignmentsParams.push(visibleIds);
            assignmentsQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
        }
        assignmentsQuery += ` ORDER BY a.created_at DESC LIMIT 5`;

        const assignments = await pool.query(assignmentsQuery, assignmentsParams);

        // Search proposals
        let proposalsQuery = `
            SELECT p.id, p.number, p.status, p.quotation_amount,
                    c.name as client_name
             FROM proposals p
             LEFT JOIN clients c ON c.id = p.client_id
             WHERE (p.number ILIKE $1 OR c.name ILIKE $1 OR p.scope_areas ILIKE $1)`;
        const proposalsParams: unknown[] = [searchPattern];
        if (visibleIds !== null) {
            proposalsParams.push(visibleIds);
            proposalsQuery += ` AND (p.responsible_partner = ANY($2) OR p.prepared_by = ANY($2))`;
        }
        proposalsQuery += ` ORDER BY p.created_at DESC LIMIT 5`;

        const proposals = await pool.query(proposalsQuery, proposalsParams);

        // Search invoices
        let invoicesQuery = `
            SELECT i.id, i.sr_no, i.invoice_date, i.net_amount, i.narration,
                    c.name as client_name, a.id as assignment_id
             FROM invoices i
             LEFT JOIN assignments a ON a.id = i.assignment_id
             LEFT JOIN clients c ON c.id = a.client_id
             WHERE (i.narration ILIKE $1 OR i.reference ILIKE $1 OR c.name ILIKE $1)`;
        const invoicesParams: unknown[] = [searchPattern];
        if (visibleIds !== null) {
            invoicesParams.push(visibleIds);
            invoicesQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2) OR i.generated_by = ANY($2))`;
        }
        invoicesQuery += ` ORDER BY i.invoice_date DESC LIMIT 5`;

        const invoices = await pool.query(invoicesQuery, invoicesParams);

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
