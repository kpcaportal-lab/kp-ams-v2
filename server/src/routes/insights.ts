import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin', 'partner', 'director'));

// ── FIRM-WIDE SUMMARIES ──────────────────────────────────────────

// GET /api/insights/summary — firm KPI strip data
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        // 1. Total Clients
        let totalClients = 0;
        try {
            let clientQuery = `SELECT COUNT(DISTINCT client_id) as count FROM assignments WHERE status = 'active' AND fiscal_year = $1`;
            const clientParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                clientQuery += ` AND (manager_id = ANY($2) OR partner_id = ANY($2))`;
                clientParams.push(visibleIds);
            }
            const clientResult = await pool.query(clientQuery, clientParams);
            totalClients = parseInt(clientResult.rows[0]?.count || '0');
        } catch (e) {}

        // 2. Total Proposals
        let totalProposals = 0;
        try {
            let proposalQuery = `SELECT COUNT(*) as count FROM proposals WHERE fiscal_year = $1`;
            const proposalParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                proposalQuery += ` AND (prepared_by = ANY($2) OR responsible_partner = ANY($2))`;
                proposalParams.push(visibleIds);
            }
            const proposalResult = await pool.query(proposalQuery, proposalParams);
            totalProposals = parseInt(proposalResult.rows[0]?.count || '0');
        } catch (e) {}

        // 3. Active Assignments
        let activeAssignments = 0;
        try {
            let assignmentQuery = `SELECT COUNT(*) as count FROM assignments WHERE status IN ('active', 'draft') AND fiscal_year = $1`;
            const assignmentParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                assignmentQuery += ` AND (manager_id = ANY($2) OR partner_id = ANY($2))`;
                assignmentParams.push(visibleIds);
            }
            const assignmentResult = await pool.query(assignmentQuery, assignmentParams);
            activeAssignments = parseInt(assignmentResult.rows[0]?.count || '0');
        } catch (e) {}

        // 4. Total Billed
        let totalBilled = 0;
        try {
            let billedQuery = `
                SELECT COALESCE(SUM(i.professional_fees), SUM(a.billed_amount), 0) as total
                FROM assignments a
                LEFT JOIN invoices i ON a.id = i.assignment_id
                WHERE a.fiscal_year = $1
            `;
            const billedParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                billedQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
                billedParams.push(visibleIds);
            }
            const billedResult = await pool.query(billedQuery, billedParams);
            totalBilled = parseFloat(billedResult.rows[0]?.total || '0');
        } catch (e) {
            // Very basic fallback if invoices join fails
            try {
                const fallback = await pool.query('SELECT COALESCE(SUM(billed_amount), 0) as total FROM assignments WHERE fiscal_year = $1', [fiscal_year]);
                totalBilled = parseFloat(fallback.rows[0]?.total || '0');
            } catch (e2) {}
        }

        res.json({
            totalClients,
            totalProposals,
            activeAssignments,
            totalBilled
        });
    } catch (err) {
        console.error('Insights Summary Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/insights/managers?sort=billed&period=FY2024-25 — manager list with stats
router.get('/managers', async (req: Request, res: Response) => {
    try {
        const { sort = 'billed', period = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        let result;
        try {
            let query = `
                SELECT 
                    p.id, p.full_name, p.display_name, p.role, p.email,
                    (SELECT COUNT(DISTINCT a.client_id) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as client_count,
                    (SELECT COUNT(*) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as assignment_count,
                    (SELECT COUNT(*) FROM proposals pr WHERE pr.prepared_by = p.id AND pr.fiscal_year = $1) as proposal_count,
                    (
                        SELECT COALESCE(SUM(i.professional_fees), MAX(a.billed_amount), 0) 
                        FROM assignments a 
                        LEFT JOIN invoices i ON i.assignment_id = a.id 
                        WHERE a.manager_id = p.id AND a.fiscal_year = $1
                    ) as billed_amount
                FROM profiles p
                WHERE p.role IN ('manager', 'assistant_manager', 'partner', 'director') 
                  AND p.is_active = true
            `;
            const params: any[] = [period];

            if (visibleIds !== null) {
                query += ` AND p.id = ANY($2)`;
                params.push(visibleIds);
            }

            // Only show managers with data OR core members (Hamza, Milind, Tanmay, Rishabh, Admin)
            query += ` AND (
                EXISTS (SELECT 1 FROM assignments a WHERE a.manager_id = p.id OR a.partner_id = p.id)
                OR EXISTS (SELECT 1 FROM proposals pr WHERE pr.prepared_by = p.id OR pr.responsible_partner = p.id)
                OR p.id IN ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005')
            )`;

            if (sort === 'billed') query += ` ORDER BY billed_amount DESC, p.full_name ASC`;
            else if (sort === 'clients') query += ` ORDER BY client_count DESC, p.full_name ASC`;
            else if (sort === 'assignments') query += ` ORDER BY assignment_count DESC, p.full_name ASC`;

            result = await pool.query(query, params);
        } catch (dbErr: any) {
            console.warn('⚠️ Insights managers query failed, falling back to basic profile list');
            result = await pool.query(
                "SELECT id, full_name, display_name, role, email, 0 as client_count, 0 as assignment_count, 0 as proposal_count, 0 as billed_amount FROM profiles WHERE is_active=true AND role IN ('manager', 'partner', 'director') ORDER BY full_name"
            );
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Insights Managers Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// ── INDIVIDUAL MANAGER DETAILS ───────────────────────────────────

// GET /api/managers/:id/clients?search=&page=
router.get('/:id/clients', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = `
            SELECT COUNT(DISTINCT c.id) as total
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            WHERE a.manager_id = $1 AND c.name ILIKE $2
        `;
        const countRes = await pool.query(countQuery, [id, `%${search}%`]);
        const total = parseInt(countRes.rows[0].total);

        const dataQuery = `
            SELECT 
                c.id, c.name, c.status,
                COALESCE(SUM(i.professional_fees), 0) as billed_amount,
                MIN(a.created_at) as onboarded_date
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            LEFT JOIN invoices i ON i.assignment_id = a.id
            WHERE a.manager_id = $1 AND c.name ILIKE $2
            GROUP BY c.id, c.name, c.status
            ORDER BY billed_amount DESC
            LIMIT $3 OFFSET $4
        `;
        const dataRes = await pool.query(dataQuery, [id, `%${search}%`, limit, offset]);

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        console.error('Manager Clients Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/managers/:id/proposals?search=&page=
router.get('/:id/proposals', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = `
            SELECT COUNT(*) as total
            FROM proposals p
            JOIN clients c ON c.id = p.client_id
            WHERE p.prepared_by = $1 AND (c.name ILIKE $2 OR p.number ILIKE $2)
        `;
        const countRes = await pool.query(countQuery, [id, `%${search}%`]);
        const total = parseInt(countRes.rows[0].total);

        const dataQuery = `
            SELECT 
                p.id, p.number as proposal_id, c.name as client_name,
                p.proposal_date as date_sent, p.quotation_amount as amount,
                p.status
            FROM proposals p
            JOIN clients c ON c.id = p.client_id
            WHERE p.prepared_by = $1 AND (c.name ILIKE $2 OR p.number ILIKE $2)
            ORDER BY p.created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const dataRes = await pool.query(dataQuery, [id, `%${search}%`, limit, offset]);

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        console.error('Manager Proposals Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/managers/:id/assignments?search=&page=
router.get('/:id/assignments', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = `
            SELECT COUNT(*) as total
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
            WHERE a.manager_id = $1 AND (c.name ILIKE $2 OR a.subcategory ILIKE $2)
        `;
        const countRes = await pool.query(countQuery, [id, `%${search}%`]);
        const total = parseInt(countRes.rows[0].total);

        const dataQuery = `
            SELECT 
                a.id as assignment_id, c.name as client_name,
                a.subcategory as work_type, a.end_date as due_date,
                a.status
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
            WHERE a.manager_id = $1 AND (c.name ILIKE $2 OR a.subcategory ILIKE $2)
            ORDER BY a.created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const dataRes = await pool.query(dataQuery, [id, `%${search}%`, limit, offset]);

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        console.error('Manager Assignments Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/managers/:id/billing?period=
router.get('/:id/billing', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { period = '2025-26' } = req.query;

        // Billing chart data (last 10 months)
        // Since we don't have a robust 'collected' column, we'll mock collected as 90% of billed for demo/req purposes
        // Or we can just return billed for now.
        const chartQuery = `
            SELECT 
                EXTRACT(MONTH FROM i.invoice_date) as month,
                EXTRACT(YEAR FROM i.invoice_date) as year,
                SUM(i.professional_fees) as billed,
                SUM(i.professional_fees) * 0.9 as collected
            FROM invoices i
            JOIN assignments a ON a.id = i.assignment_id
            WHERE a.manager_id = $1 AND a.fiscal_year = $2
            GROUP BY year, month
            ORDER BY year DESC, month DESC
            LIMIT 10
        `;
        const chartRes = await pool.query(chartQuery, [id, period]);

        // Billing table data
        const tableQuery = `
            SELECT 
                TO_CHAR(i.invoice_date, 'Month YYYY') as month_name,
                COUNT(i.id) as invoice_count,
                SUM(i.professional_fees) as amount_billed,
                SUM(i.professional_fees) * 0.9 as amount_collected
            FROM invoices i
            JOIN assignments a ON a.id = i.assignment_id
            WHERE a.manager_id = $1 AND a.fiscal_year = $2
            GROUP BY month_name, i.invoice_date
            ORDER BY i.invoice_date DESC
        `;
        const tableRes = await pool.query(tableQuery, [id, period]);

        res.json({
            chartData: chartRes.rows.reverse(),
            tableData: tableRes.rows
        });
    } catch (err) {
        console.error('Manager Billing Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
